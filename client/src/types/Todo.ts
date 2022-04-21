export interface Todo {
  todoId: string
  createdAt: string
  name: string
  dueDate: string
  done: boolean
  attachmentUrl?: string
  imageId?: string
}

export interface ImageTDO {
  imageId: string
  title: string
  imageUrl: string
}
