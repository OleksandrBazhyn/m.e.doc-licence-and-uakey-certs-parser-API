import { useState } from "react";
import SearchForm from "../components/SearchForm";
import ResultDisplay from "../components/ResultDisplay";
import { fetchCompanyData } from "../utils/api";

export default function Home() {
    const [usreou, setUsreou] = useState("");
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    const handleSearch = async () => {
        setError(null);
        setData(null);
        try {
            const result = await fetchCompanyData(usreou);
            setData(result);
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="container">
            <h1>Пошук компанії за USREOU</h1>
            <SearchForm usreou={usreou} setUsreou={setUsreou} onSearch={handleSearch} />
            {error && <p className="error">{error}</p>}
            {data && <ResultDisplay data={data} />}
        </div>
    );
}
