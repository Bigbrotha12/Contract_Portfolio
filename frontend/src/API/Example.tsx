import { useQuery } from '@tanstack/react-query'

export default function Example() {
    const { isLoading, error, data } = useQuery(['repoData'], () =>
      fetch('https://api.github.com/repos/tannerlinsley/react-query').then(res =>
        res.json()
      )
    )
  
    if (isLoading) return (<p>"Loading..."</p>);

    if (error instanceof Error) return (<p>{"An error has occurred: " + error.message}</p>);
  
    return (
      <div>
        <h1>{data.name}</h1>
        <p>{data.description}</p>
        <strong>👀 {data.subscribers_count}</strong>{' '}
        <strong>✨ {data.stargazers_count}</strong>{' '}
        <strong>🍴 {data.forks_count}</strong>
      </div>
    )
  }