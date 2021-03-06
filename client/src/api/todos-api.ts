import { apiEndpoint } from '../config'
import { Todo } from '../types/Todo';
import { CreateTodoRequest } from '../types/CreateTodoRequest';
import Axios from 'axios'
import { UpdateTodoRequest } from '../types/UpdateTodoRequest';

export async function getTodos(idToken: string, nextKey?: string | null): Promise<any> {
  console.log('Fetching todos')
  const url = (nextKey === undefined || nextKey === '') ? `${apiEndpoint}/todos?limit=2` : `${apiEndpoint}/todos?limit=2&nextKey=${nextKey}`
  const response = await Axios.get(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Todos:', response.data)
  return response.data
}

export async function getTodosByDueDate(idToken: string, sortby: string, nextKey?: string | null): Promise<any> {
  console.log('Fetching todos by due date')
  const url = (nextKey === undefined || nextKey === '') ? `${apiEndpoint}/todos/duedate/${sortby}?limit=2` : `${apiEndpoint}/todos/duedate/${sortby}?limit=2&nextKey=${nextKey}`
  const response = await Axios.get(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Todos:', response.data)
  return response.data
}

export async function createTodo(
  idToken: string,
  newTodo: CreateTodoRequest
): Promise<Todo> {
  const response = await Axios.post(`${apiEndpoint}/todos`,  JSON.stringify(newTodo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function patchTodo(
  idToken: string,
  todoId: string,
  updatedTodo: UpdateTodoRequest
): Promise<void> {
  await Axios.patch(`${apiEndpoint}/todos/${todoId}`, JSON.stringify(updatedTodo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function deleteTodo(
  idToken: string,
  todoId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/todos/${todoId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
}

export async function getUploadUrl(
  idToken: string,
  todoId: string,
  title: string
): Promise<string> {
  const response = await Axios.post(`${apiEndpoint}/todos/${todoId}/attachment`, JSON.stringify({ title }), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.uploadUrl
}

export async function uploadFile(uploadUrl: string, file: Buffer): Promise<void> {
  await Axios.put(uploadUrl, file)
}

export async function getTodoImage(idToken: string, todoId: string, imageId?: string): Promise<any> {
  console.log('Get todo image')
  const response = await Axios.get(`${apiEndpoint}/todos/${todoId}/image/${imageId}`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    },
  })
  console.log('Todo image:', response.data)
  return response.data
}
