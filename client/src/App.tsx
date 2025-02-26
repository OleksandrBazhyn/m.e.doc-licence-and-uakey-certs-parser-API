import React, { useState } from "react";
import axios from "axios";

const App: React.FC = () => {
  const [usreou, setUsreou] = useState("");
  const [data, setData] = useState<any>(null);
  const [endpoint, setEndpoint] = useState("search");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`http://localhost:3000/api/${endpoint}/${usreou}`);
      setData(response.data);
    } catch (err) {
      setError("Помилка при отриманні даних");
      setData(null);
    }
    setLoading(false);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Пошук за ЄДРПОУ</h1>
      <input
        type="text"
        value={usreou}
        onChange={(e) => setUsreou(e.target.value)}
        placeholder="Введіть ЄДРПОУ"
        style={{ padding: "10px", marginRight: "10px" }}
      />
      <select value={endpoint} onChange={(e) => setEndpoint(e.target.value)}>
        <option value="search">Загальний пошук</option>
        <option value="uakey">Тільки uakey</option>
        <option value="medoc">Тільки medoc</option>
      </select>
      <button onClick={fetchData} style={{ marginLeft: "10px", padding: "10px" }}>Пошук</button>

      {loading && <p>Завантаження...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      
      {data && (
        <div>
          {data.medoc && (
            <div>
              <h2>Medoc</h2>
              <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {Object.keys(data.medoc).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {Object.values(data.medoc).map((value, index) => (
                      <td key={index}>{String(value)}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          
          {data.uakey && (
            <div>
              <h2>UAKey</h2>
              <table border="1" cellPadding="5" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {Object.keys(data.uakey).map((key) => (
                      <th key={key}>{key}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    {Object.values(data.uakey).map((value, index) => (
                      <td key={index}>{String(value)}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default App;
