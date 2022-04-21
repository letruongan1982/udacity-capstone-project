import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Modal
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodoImage, getTodos, getTodosByDueDate, patchTodo } from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo, ImageTDO } from '../types/Todo'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  newTodoName: string
  loadingTodos: boolean
  pageNext: string | null
  pagePrev: string | null,
  dueDate: string | null,
  openModal: boolean,
  selectedTodo: string | null,
  enlargeImage: ImageTDO | null
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    newTodoName: '',
    loadingTodos: true,
    pageNext: '',
    pagePrev: '',
    dueDate: null,
    openModal: false,
    selectedTodo: null,
    enlargeImage: null
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }

  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onTodoCreate = async (event: React.ChangeEvent<HTMLButtonElement>) => {
    try {
      const dueDate = this.calculateDueDate()
      const newTodo = await createTodo(this.props.auth.getIdToken(), {
        name: this.state.newTodoName,
        dueDate
      })
      this.setState({
        todos: [...this.state.todos, newTodo],
        newTodoName: ''
      })
    } catch {
      alert('Todo creation failed, pls check your input data')
    }
  }

  onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(this.props.auth.getIdToken(), todoId)
      this.setState({
        todos: this.state.todos.filter(todo => todo.todoId !== todoId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const todo = this.state.todos[pos]
      await patchTodo(this.props.auth.getIdToken(), todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      })
    } catch {
      alert('Update Todo done is failed')
    }
  }

  onNextPage = () => {
    const { pageNext } = this.state;

    this.setState({ loadingTodos: true })
    
    this.nextPage(pageNext)
  }

  nextPage = async (key?: string | null) => {
    const { dueDate } = this.state;

    const resp = dueDate ? 
      (key === undefined) ? await getTodosByDueDate(this.props.auth.getIdToken(), dueDate || 'asc' ) : await getTodosByDueDate(this.props.auth.getIdToken(), dueDate || 'asc', key) : 
      (key === undefined) ? await getTodos(this.props.auth.getIdToken()) : await getTodos(this.props.auth.getIdToken(), key)
    
    const { items, nextKey } = resp;
    const { todos } = this.state;
    this.setState({
      todos: todos.concat(items),
      loadingTodos: false,
      pageNext: nextKey
    })
  }

  onDueDate = () => {
    const { dueDate } = this.state;
    let newDueDate = dueDate===null || dueDate === 'desc' ? 'asc' : 'desc'
    this.dueDate(newDueDate)
    this.setState({
      dueDate: newDueDate
    })
  }

  dueDate = async (sortby: string) => {
    const resp = await getTodosByDueDate(this.props.auth.getIdToken(), sortby)
    const { items, nextKey } = resp;
    // const { todos } = this.state;
    this.setState({
      todos: items,
      loadingTodos: false,
      pageNext: nextKey
    })
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return date.toISOString()
  }

  enlargeImage = async (todoId: string, imageId?: string) => {
    this.setOpen(true);
    
    const image: ImageTDO = await getTodoImage(this.props.auth.getIdToken(), todoId, imageId)
    this.setState({
      enlargeImage: image
    })
  }

  setOpen(status: boolean) {
    this.setState({openModal: status});
  }

  fetchTodoImage = () => {
    console.log('fetch todo image')
  }

  componentDidMount() {
    try {
      this.nextPage();
    } catch (e) {
      let errorMessage = "Failed to fetch todos";
      if(e instanceof Error) {
      	errorMessage = e.message;
      }
      alert(`Failed to fetch todos: ${errorMessage}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">TODOs</Header>

        {this.renderCreateTodoInput()}

        {this.renderTodos()}

        {this.renderModal()}
      </div>
    )
  }

  renderCreateTodoInput() {
    const { newTodoName } = this.state;
    return (
      <Grid.Row style={{ marginBottom: '2em' }}>
        <Grid.Column width={16}>
          <Input
            action={{
              color: 'teal',
              labelPosition: 'left',
              icon: 'add',
              content: 'New task',
              onClick: this.onTodoCreate
            }}
            fluid
            actionPosition="left"
            placeholder="To change the world..."
            onChange={this.handleNameChange}
            value={newTodoName}
          />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderHeader() {
    const { dueDate } = this.state;
    return (
      <Grid.Row>
        <Grid.Column width={1} verticalAlign="middle">&nbsp;</Grid.Column>
        <Grid.Column width={5} verticalAlign="middle">Name</Grid.Column>
        <Grid.Column width={3} verticalAlign="middle">Image</Grid.Column>
        <Grid.Column width={5} verticalAlign="middle">
          <Button style={{ marginLeft: '10px'}} icon onClick={() => this.onDueDate()}>Due Date
            {dueDate && <Icon link name={dueDate === 'asc' ? 'caret up' : 'caret down'} />}
          </Button>
        </Grid.Column>
        <Grid.Column width={1} verticalAlign="middle"></Grid.Column>
        <Grid.Column width={1} verticalAlign="middle"></Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <Grid padded className='todo-list'>
        {this.renderHeader()}
        {this.state.todos.map((todo, pos) => {
          return (
            <Grid.Row key={todo.todoId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onTodoCheck(pos)}
                  checked={todo.done}
                />
              </Grid.Column>
              <Grid.Column width={5} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={3} verticalAlign="middle">
              {todo.attachmentUrl && (
                <div style={{ float: 'left' }} >
                  <Image style={{ marginRight: '10px', float: 'left' }} src={todo.attachmentUrl} size="small" wrapped/>
                  <Button style={{ float: 'left', width: '40px' }} basic size='mini' onClick={() => this.enlargeImage(todo.todoId, todo.imageId) }><Icon name='external alternate'/></Button>
                </div>
              )}
              {!todo.attachmentUrl && (
                <Image style={{ float: 'left' }} src={process?.env.PUBLIC_URL + 'no-image-800x600.png'} size="small" wrapped/>
              )}
              </Grid.Column>
              <Grid.Column width={5} verticalAlign="middle">
                {todo.dueDate}
              </Grid.Column>
              <Grid.Column width={1} verticalAlign="middle">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(todo.todoId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} verticalAlign="middle">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(todo.todoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
        {this.state.loadingTodos && this.renderLoading()}
        {this.state.pageNext && !this.state.loadingTodos &&
        <Grid.Row>
          <Grid.Column width={16} textAlign='center'>
            <Button icon labelPosition='right' onClick={() => this.onNextPage()}>
              Load more...
              <Icon name="angle right"/>
            </Button>
          </Grid.Column>
        </Grid.Row>
        }
      </Grid>
    )
  }

  renderModal () {
    const { openModal, enlargeImage } = this.state;
    return (
      <Modal
        basic
        onClose={() => this.setOpen(false)}
        onOpen={() => this.fetchTodoImage()}
        open={openModal}
        size='small'
      >
        <Header>{enlargeImage?.title}</Header>
        <Modal.Content>
          {enlargeImage && <Image src={enlargeImage?.imageUrl}/>}
        </Modal.Content>
        <Modal.Actions>
          <Button basic color='red' inverted onClick={() => this.setOpen(false)}>Close</Button>
        </Modal.Actions>
      </Modal>
    )
  }
}
