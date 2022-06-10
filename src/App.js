import React, { useState } from "react"
import { useQuery, gql, useMutation } from "@apollo/client"

const GET_TODOS = gql`
	query getTodos {
		todos {
			id
			text
			done
		}
	}
`
const TOGGLE_TODO = gql`
	mutation toggleTodo($id: uuid!, $done: Boolean!) {
		update_todos(where: { id: { _eq: $id } }, _set: { done: $done }) {
			returning {
				done
				id
				text
			}
		}
	}
`
const ADD_TODO = gql`
	mutation addTodo($text: String!) {
		insert_todos(objects: { text: $text }) {
			returning {
				text
				id
				done
			}
		}
	}
`
const DELETE_TODO = gql`
	mutation deletTodo($id: uuid!) {
		delete_todos(where: { id: { _eq: $id } }) {
			returning {
				done
				id
				text
			}
		}
	}
`
function App() {
	const [todoText, setTodoText] = useState("")
	const { data, loading, error } = useQuery(GET_TODOS)
	const [toggleTodo] = useMutation(TOGGLE_TODO)
	const [addTodo] = useMutation(ADD_TODO, {
		onCompleted: () => setTodoText(""),
	})
	const [deleteTodo] = useMutation(DELETE_TODO)

	const handleToggleTodo = async ({ id, done }) => {
		await toggleTodo({ variables: { id, done: !done } })
	}

	async function handleAddTodo(event) {
		event.preventDefault()
		if (!todoText.trim()) return
		const data = await addTodo({
			variables: { text: todoText },
			refetchQueries: [{ query: GET_TODOS }],
		})
		console.log(data)
	}

	async function handleDeleteTodo(id) {
		const isConfirmed = window.confirm("Do you want to delelte this todo?")
		if (isConfirmed) {
			await deleteTodo({
				variables: { id },
				update: (cache) => {
					const prevData = cache.readQuery({ query: GET_TODOS })
					const newTodos = prevData.todos.filter((todo) => todo.id !== id)
					cache.writeQuery({ query: GET_TODOS, data: { todos: newTodos } })
				},
			})
		}
	}
	if (loading) return <div>Loading todos...</div>
	if (error) return <div>{"Error occured while fething todos :("}</div>
	return (
		<div className="vh-100 code flex flex-column items-center bg-purple white pa3 fl-1">
			<h1 className="f2-l">
				GraphQl Checklist{" "}
				<span role="img" aria-label="Checkmark">
					✅
				</span>
			</h1>
			{/*Todo Form*/}
			<form className="mb3" onSubmit={handleAddTodo}>
				<input
					className="pa2 f4 b--dashed"
					type="text"
					placeholder="Write your Todo"
					onChange={(event) => setTodoText(event.target.value)}
					value={todoText}
				></input>
				<button
					className="f4 bg-green pv2 ph3 ba bw2 black br-pill dib"
					type="submit"
				>
					Create
				</button>
			</form>
			{/*Todo List*/}
			<div className="flex flex-column items-center justify-center">
				{data.todos.map((todo) => (
					<p
						onDoubleClick={() => {
							handleToggleTodo(todo)
						}}
						key={todo.id}
					>
						<span className={`pointer list pa1 f3 ${todo.done && "strike"}`}>
							{todo.text}
						</span>
						<button
							onClick={() => handleDeleteTodo(todo.id)}
							className="bg-transparent bn f4"
						>
							<span className="red">&times;</span>
						</button>
					</p>
				))}
			</div>
		</div>
	)
}

export default App
