export default function SearchForm({ usreou, setUsreou, onSearch }) {
    return (
        <div>
            <input 
                type="text" 
                value={usreou} 
                onChange={(e) => setUsreou(e.target.value)} 
                placeholder="Введіть USREOU"
            />
            <button onClick={onSearch}>Шукати</button>
        </div>
    );
}
