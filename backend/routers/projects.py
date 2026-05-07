from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
import models, schemas
from auth_utils import get_current_user

router = APIRouter()

def get_project_or_404(project_id: int, db: Session):
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project

def is_project_admin(project_id: int, user_id: int, db: Session) -> bool:
    member = db.query(models.ProjectMember).filter(
        models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == user_id
    ).first()
    return member and member.role == models.RoleEnum.admin

@router.post("/", response_model=schemas.ProjectOut)
def create_project(
    data: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    project = models.Project(**data.dict(), created_by=current_user.id)
    db.add(project)
    db.flush()

    # Creator becomes admin of the project
    membership = models.ProjectMember(
        project_id=project.id,
        user_id=current_user.id,
        role=models.RoleEnum.admin
    )
    db.add(membership)
    db.commit()
    db.refresh(project)
    return project

@router.get("/", response_model=List[schemas.ProjectOut])
def list_projects(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    if current_user.role == models.RoleEnum.admin:
        return db.query(models.Project).all()
    # Members see only their projects
    member_rows = db.query(models.ProjectMember).filter(
        models.ProjectMember.user_id == current_user.id
    ).all()
    ids = [r.project_id for r in member_rows]
    return db.query(models.Project).filter(models.Project.id.in_(ids)).all()

@router.get("/{project_id}", response_model=schemas.ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return get_project_or_404(project_id, db)

@router.put("/{project_id}", response_model=schemas.ProjectOut)
def update_project(
    project_id: int,
    data: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    project = get_project_or_404(project_id, db)
    if project.created_by != current_user.id and current_user.role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    for k, v in data.dict(exclude_unset=True).items():
        setattr(project, k, v)
    db.commit()
    db.refresh(project)
    return project

@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    project = get_project_or_404(project_id, db)
    if project.created_by != current_user.id and current_user.role != models.RoleEnum.admin:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(project)
    db.commit()
    return {"message": "Project deleted"}

@router.post("/{project_id}/members")
def add_member(
    project_id: int,
    data: schemas.ProjectMemberAdd,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    project = get_project_or_404(project_id, db)
    if project.created_by != current_user.id and not is_project_admin(project_id, current_user.id, db):
        raise HTTPException(status_code=403, detail="Only project admins can add members")
    existing = db.query(models.ProjectMember).filter(models.ProjectMember.project_id == project_id,
        models.ProjectMember.user_id == data.user_id
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="User already a member")
    member = models.ProjectMember(project_id=project_id, user_id=data.user_id, role=data.role)
    db.add(member)
    db.commit()
    return {"message": "Member added"}