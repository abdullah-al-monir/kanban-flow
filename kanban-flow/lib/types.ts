export type BoardRole = "OWNER" | "ADMIN" | "EDITOR" | "VIEWER"

export interface AuthUser {
  id: string
  email: string
  fullName: string
}

export interface PublicUser {
  id: string
  email: string
  fullName: string
  avatarUrl: string | null
  createdAt?: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: AuthUser
}

export interface Label {
  id: string
  boardId: string
  name: string
  colorHex: string
}

export interface TaskLabel {
  label: Label
}

export interface Task {
  id: string
  columnId: string
  creatorId: string
  assigneeId: string | null
  title: string
  description: string | null
  position: number
  dueDate: string | null
  isArchived: boolean
  createdAt: string
  updatedAt: string
  assignee: PublicUser | null
  creator: PublicUser
  labels: TaskLabel[]
}

export interface Column {
  id: string
  boardId: string
  title: string
  position: number
  createdAt: string
  updatedAt: string
  tasks: Task[]
}

export interface BoardMember {
  id: string
  boardId: string
  userId: string
  role: BoardRole
  joinedAt: string
  user: PublicUser
}

export interface BoardSummary {
  id: string
  title: string
  description: string | null
  ownerId: string
  isArchived: boolean
  createdAt: string
  updatedAt: string
  myRole: BoardRole
  _count: { columns: number; members: number }
}

export interface BoardDetail {
  id: string
  title: string
  description: string | null
  ownerId: string
  isArchived: boolean
  createdAt: string
  updatedAt: string
  members: BoardMember[]
  labels: Label[]
  columns: Column[]
}

export type ActivityType =
  | "TASK_CREATED"
  | "TASK_MOVED"
  | "TASK_UPDATED"
  | "TASK_ARCHIVED"
  | "TASK_DELETED"
  | "COLUMN_CREATED"
  | "COLUMN_UPDATED"
  | "COLUMN_REORDERED"
  | "COLUMN_DELETED"
  | "MEMBER_ADDED"
  | "MEMBER_REMOVED"
  | "BOARD_UPDATED"

export interface Activity {
  id: string
  boardId: string
  taskId: string | null
  userId: string
  type: ActivityType
  payload: Record<string, unknown> | null
  createdAt: string
  user: {
    id: string
    fullName: string
    email: string
    avatarUrl: string | null
  }
  task: {
    id: string
    title: string
    column: { id: string; title: string }
  } | null
}

export interface ActivityListResponse {
  items: Activity[]
  total: number
  limit: number
  offset: number
}

export interface ApiError {
  statusCode: number
  message: string | string[]
  error?: string
}
