export default function ResultDisplay({ data }) {
    return (
        <div>
            <h2>Результат:</h2>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    );
}
