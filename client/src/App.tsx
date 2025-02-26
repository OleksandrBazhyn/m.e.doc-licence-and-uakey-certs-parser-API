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

  // Функція рендерингу значень
  const renderValue = (value: any) => {
    if (Array.isArray(value)) {
      return value.length > 0 ? (
        <ul>
          {value.map((item, idx) => (
            <li key={idx}>{renderValue(item)}</li>
          ))}
        </ul>
      ) : (
        <span>-</span>
      );
    } else if (typeof value === "object" && value !== null) {
      return (
        <div style={{ paddingLeft: "20px" }}>
          {Object.keys(value).map((key) => (
            <div key={key}>
              <strong>{key}:</strong> {renderValue(value[key])}
            </div>
          ))}
        </div>
      );
    } else {
      return value !== undefined ? String(value) : <span>-</span>;
    }
  };

  // Функція для копіювання в буфер обміну
  const copyToClipboard = (content: string) => {
    navigator.clipboard.writeText(content)
      .then(() => alert("Інформація скопійована!"))
      .catch((err) => console.error("Помилка при копіюванні: ", err));
  };

  // Рендеринг таблиці для властивостей
  const renderTable = (tableData: any) => {
    const keys = Object.keys(tableData);
    return (
      <table border="1" cellPadding="5" style={{ borderCollapse: "collapse", marginBottom: "20px" }}>
        <thead>
          <tr>
            <th style={{ textAlign: "left", padding: "8px" }}>Властивість</th>
            <th style={{ textAlign: "left", padding: "8px" }}>Значення</th>
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => (
            <tr key={key}>
              <td style={{ padding: "8px" }}><strong>{key}</strong></td>
              <td style={{ padding: "8px" }}>{renderValue(tableData[key])}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
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
      <button onClick={fetchData} style={{ marginLeft: "10px", padding: "10px" }}>
        Пошук
      </button>

      {loading && <p>Завантаження...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {data && (
        <div>
          <h3>Результати для ЄДРПОУ: {usreou}</h3>
          {data.medoc && (
            <div>
              <h2>Модуль M.E.Doc</h2>
              {renderTable(data.medoc)}
            </div>
          )}

          {data.uakey && (
            <div>
              <h2>UAKey</h2>
              {renderTable(data.uakey)}
            </div>
          )}

          {/* Кнопка для копіювання інформації в буфер обміну */}
          <button onClick={() => copyToClipboard(`Код ЄДРПОУ: ${usreou}\nЛіцензія M.E.Doc: ${data.medoc?.license || "Не визначено"}\nКомплект бланків: ${data.medoc?.completeness || "Не визначено"}`)} style={{ padding: "10px", marginTop: "20px" }}>
            Копіювати в буфер обміну
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
