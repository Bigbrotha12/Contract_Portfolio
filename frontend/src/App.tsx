import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Header from "./Components/Header";
import Example from "./API/Example";
import React from "react";

const queryClient = new QueryClient();

const App = () => (
    <React.StrictMode>
        <Header />
        <QueryClientProvider client={queryClient} >
            <Example />
        </QueryClientProvider>
    </React.StrictMode>
)

export default App;

