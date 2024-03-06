import './App.css';
import MyNavbar from './MyNavbar';
import itemListData from './data'
import ItemList from "./ItemList";

function App() {


    return (
        <div className="App">
            <MyNavbar/>
            {/*<header className="App-header">*/}
            {/*</header>*/}
            <div className="main-bg">
            </div>
            <ItemList itemListData={itemListData}/>
        </div>
    );
}

export default App;
