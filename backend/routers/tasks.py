from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
import models, schemas
from auth_utils import get_current_user

router = APIRouter()

@router.post("/", response_model=schemas.TaskOut)
def create_task(
    data: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    # Check project exists
    project = db.query(models.Project).filter(models.Project.id == data.project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Only admin or project admin can create tasks
    if current_user.role != models.RoleEnum.admin:
        membership = db.query(models.ProjectMember).filter(
            models.ProjectMember.project_id == data.project_id,
            models.ProjectMember.user_id == current_user.id,
            models.ProjectMember.role == models.RoleEnum.admin
        ).first()
        if not membership:
            raise HTTPException(status_code=403, detail="Only project admins can create tasks")

    task = models.Task(**data.dict(), created_by=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.get("/", response_model=List[schemas.TaskOut])
def list_tasks(
    project_id: Optional[int] = None,
    status: Optional[models.StatusEnum] = None,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    query = db.query(models.Task)
    if project_id:
        query = query.filter(models.Task.project_id == project_id)
    if status:
        query = query.filter(models.Task.status == status)
    if current_user.role != models.RoleEnum.admin:
        # Members see tasks assigned to them or in their projects
        member_rows = db.query(models.ProjectMember).filter(
            models.ProjectMember.user_id == current_user.id
        ).all()
        project_ids = [r.project_id for r in member_rows]
        query = query.filter(models.Task.project_id.in_(project_ids))
    return query.all()

@router.get("/dashboard", response_model=dict)
def dashboard(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    base = db.query(models.Task)
    if current_user.role != models.RoleEnum.admin:
        member_rows = db.query(models.ProjectMember).filter(
            models.ProjectMember.user_id == current_user.id
        ).all()
        ids = [r.project_id for r in member_rows]
        base = base.filter(models.Task.project_id.in_(ids))

    from datetime import datetime
    total = base.count()
    todo = base.filter(models.Task.status == models.StatusEnum.todo).count()
    in_progress = base.filter(models.Task.status == models.StatusEnum.in_progress).count()
    done = base.filter(models.Task.status == models.StatusEnum.done).count()
    overdue = base.filter(
        models.Task.due_date < datetime.utcnow(),
        models.Task.status != models.StatusEnum.done
    ).count()

    return {
        "total": total,
        "todo": todo,
        "in_progress": in_progress,
        "done": done,
        "overdue": overdue
    }

@router.get("/{task_id}", response_model=schemas.TaskOut)
def get_task(task_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.put("/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: int,
    data: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Members can only update status of tasks assigned to them
    if current_user.role == models.RoleEnum.member:
        if task.assigned_to != current_user.id:
            raise HTTPException(status_code=403, detail="You can only update tasks assigned to you")
        # Members can only change status
        allowed = {"status"}
        update_data = {k: v for k, v in data.dict(exclude_unset=True).items() if k in allowed}
    else:
        update_data = data.dict(exclude_unset=True)

    for k, v in update_data.items():
        setattr(task, k, v)
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    if current_user.role != models.RoleEnum.admin and task.created_by != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}