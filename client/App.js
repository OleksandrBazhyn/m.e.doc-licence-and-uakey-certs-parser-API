import { useState } from "react";
import SearchForm from "./components/SearchForm";
import Results from "./components/Results";

function App() {
    const [data, setData] = useState(null);

    return (
        <div>
            <h1>USREOU Search</h1>
            <SearchForm onDataFetched={setData} />
            {data && <Results data={data} />}
        </div>
    );
}

export default App;
