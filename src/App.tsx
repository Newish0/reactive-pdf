import "./App.css";
import "@picocss/pico";
import PDFRearranger from "./components/PDFRearranger";

function App() {
    return (
        <div className="App">
            <header>
                <div className="container">
                    <h1>Reactive PDF Tool</h1>
                </div>
            </header>

            <main className="container">
                <PDFRearranger />
            </main>
        </div>
    );
}

export default App;
