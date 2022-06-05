import React from "react"
import { useQuery, gql } from "@apollo/client"

const GET_TODOS = gql`
	query getTodos {
		todos {
			id
			text
			done
		}
	}
`
function App() {
	const { data, loading, error } = useQuery(GET_TODOS)
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
			<form className="mb3">
				<input
					className="pa2 f4 b--dashed"
					type="text"
					placeholder="Write your Todo"
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
					<p key={todo.id}>
						<span className="pointer list pa1 f3">{todo.text}</span>
						<button className="bg-transparent bn f4">
							<span className="green">&times;</span>
						</button>
					</p>
				))}
			</div>
		</div>
	)
}

export default App
