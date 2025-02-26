import { useState } from "react";

function SearchForm({ onDataFetched }) {
    const [usreou, setUsreou] = useState("");

    const handleSearch = async () => {
        const response = await fetch(`/api/search/${usreou}`);
        const result = await response.json();
        onDataFetched(result);
    };

    return (
        <div>
            <input
                type="text"
                placeholder="Введіть код ЄДРПОУ"
                value={usreou}
                onChange={(e) => setUsreou(e.target.value)}
            />
            <button onClick={handleSearch}>Пошук</button>
        </div>
    );
}

export default SearchForm;
