const BASE_URL = 'https://team-task-manager-production-659b.up.railway.app'

async function request(method, path, body = null) {
  const headers = { 'Content-Type': 'application/json' }
  const token = localStorage.getItem('token')
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

export const api = {
  signup: (data) => request('POST', '/auth/signup', data),
  login: (data) => request('POST', '/auth/login', data),
  getMe: () => request('GET', '/users/me'),
  getUsers: () => request('GET', '/users/'),
  createProject: (data) => request('POST', '/projects/', data),
  getProjects: () => request('GET', '/projects/'),
  getProject: (id) => request('GET', `/projects/${id}`),
  updateProject: (id, data) => request('PUT', `/projects/${id}`, data),
  deleteProject: (id) => request('DELETE', `/projects/${id}`),
  addMember: (projectId, data) => request('POST', `/projects/${projectId}/members`, data),
  createTask: (data) => request('POST', '/tasks/', data),
  getTasks: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request('GET', `/tasks/${q ? '?' + q : ''}`)
  },
  getDashboard: () => request('GET', '/tasks/dashboard'),
  updateTask: (id, data) => request('PUT', `/tasks/${id}`, data),
  deleteTask: (id) => request('DELETE', `/tasks/${id}`),
}