import logo from './logo.svg';
import './App.css';
import {useState} from "react";
import React from "react";

function App() {

    /* 최상위 컴포넌트인 App()에 선언된 변수에서 setState를 호출할 경우 하위 컴포넌트 전체를 Re-Rendering
    * Math.Random()으로 생성된 날짜 값이 계속 변동됨.
    * 가급적 state는 Leaf 컴포넌트에 선언 할 것*/
    let subject = "서면 맛집 추천"
    let data = 'red'
    let [a, b] = useState('남자 헤어 추천');
    let [string, setString] = useState(['남자 헤어 추천', '여자 헤어 추천', '자유 헤어 추천'])

    let [count, setCount] = useState(0)
    let [modalIndex, setModalIndex] = useState(0)

    let [inputValue, setInputValue] = useState("")

    /* State의 set은 batching이 일어나기 떄문에 연속적으로 set할 경우 함수형 */
    function letsTest() {
        for (let i = 0; i < 1000; i++) {
            setCount(count + 1)
        }
    } // result : count +1

    function letsTest2() {
        for (let i = 0; i < 1000; i++) {
            setCount(count => count + 1)
        }
    } //result : count + 1000
    //양쪽 모두 re-rendering은 한 번만 일어남.


    const list = () => {
        const result = [];
        for (let i = 0; i < string.length; i++) {
            result.push(
                <div className="list" key={i}>
                    <p onClick={() => openModal(i)}>{string[i]} </p>
                    <p>
                        {(i + Math.floor(Math.random() * 10)) % 12}월 {i + Math.floor(Math.random() * 10)}일 발행{" "}
                        <span onClick={() => likeUp(i)}>❤ {like[i]}</span>
                    </p>
                </div>
            );
        }
        return result;
    };
    let [like, setLike] = useState(Array.from({length: string.length}, () => 0));
    let [modal, setModal] = useState(false);

    function likeUp(index) {
        const updatedLikes = [...like];
        updatedLikes[index] += 1;
        setLike(updatedLikes);
    }

    let [titleIndex, setTitleIndex] = useState(0)

    function title(index) {
        return string[index]
    }

    function countTitleIndex() {
        setTitleIndex((titleIndex + 1) % 3)
    }

    function sortPost() {
        setString([...string].sort())
        setLike([...like].sort())
    }

    function reversPost() {
        setString([...string].reverse())
        setLike([...like].reverse())
    }

    function toggleModal() {
        setModal(!modal)
    }

    // function openModal(index) {
    //     if (modal && modalTitle === string[index]) {
    //         setModal(false);
    //     } else {
    //         setModal(true);
    //         setModalTitle(string[index]);
    //     }
    // }

    function openModal(index) {
        if (modal && modalIndex === index) {
            setModal(false);
        } else {
            setModal(true);
            setModalIndex(index);
        }
    }

    function updateString(index, newString) {
        let copy = [...string];
        copy[index] = newString;
        setString(copy);
    }

    function addString(input) {
        let copy = [...string];
        copy.push(input)
        setString(copy)
    }

    function addLike(initial = 0) {
        let copy = [...like]
        copy.push(initial)
        setLike(copy)
    }

    function addPost(input) {
        addString(input)
        addLike()
    }

    // let [modalTitle, setModalTitle] = useState("")
    //
    // function Modal() {
    //     let [day, setDay] = useState(Math.floor(Math.random() * 10))
    //
    //     function changeDay() {
    //         setDay(Math.floor(Math.random() * 10))
    //     }
    //
    //     return (
    //         <>
    //             <button onClick={() => changeDay()}>버튼</button>
    //             <div className="modal">
    //                 <h4>제목 : {modalTitle}</h4>
    //                 <p>{day}</p>
    //                 <p>상세 내용</p>
    //             </div>
    //         </>
    //     )
    // }


    return (
        <div className="App">
            <div className={"black-nav"}>
                <h4>블로그</h4>
                <p>{count}</p>
                <button onClick={letsTest}>그냥</button>
                <button onClick={letsTest2}>함수형</button>
            </div>
            <button onClick={sortPost}> 정렬 버튼</button>
            <button onClick={reversPost}> 반전 버튼</button>
            <button onClick={toggleModal}>모달 버튼</button>

            <div className="list">
                <h2>{title(titleIndex)} <span onClick={countTitleIndex}>👌</span></h2>
            </div>
            <div className="list">
                <h4>{subject}</h4>
                <p>3월 4일 발행</p>
            </div>
            <div>
                {list()}
            </div>
            {/*{modal === true ? <Modal/>  : null}*/}
            {modal === true ?
                <Modal string={string[modalIndex]} modalIndex={modalIndex} updateString={updateString}/> : null}

            <p>{((Math.floor(Math.random() * 10))) % 12}월 {(Math.floor(Math.random() * 10))}일 발행</p>
            <Random></Random>
            <Rerendor></Rerendor>

            <input type="text" onChange={(e) => {
                setInputValue(e.target.value)
            }}/>
            <button onClick={() => {
                addPost(inputValue)
            }}>발행
            </button>

        </div>
    );
}

function Modal(props) {
    let [day, setDay] = useState(Math.floor(Math.random() * 10))

    function changeDay() {
        setDay(Math.floor(Math.random() * 10))
    }

    return (
        <>
            <button onClick={() => changeDay()}>버튼</button>
            <div className="modal">
                <h4>제목 : {props.string}</h4>
                <p>{day}</p>
                <p>상세 내용</p>
                <button onClick={() => props.updateString(props.modalIndex, "검열됨")}>검열</button>
            </div>
        </>
    )
}

function Random() {
    return <p>{((Math.floor(Math.random() * 10))) % 12}월 {(Math.floor(Math.random() * 10))}일 발행</p>
}

function Rerendor() {
    let [number, setNumber] = useState(0)

    console.log({number})
    return <>
        <p>{number}</p>
        <button onClick={() => {
            setNumber(Math.floor(Math.random() * 10))
        }}>click
        </button>
    </>
}

class modal2 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: 'Lee',
            age: 20
        }
    }

    render() {
        return (
            <div>hello class {this.props.params}</div>
        )
    }
}

export default App;