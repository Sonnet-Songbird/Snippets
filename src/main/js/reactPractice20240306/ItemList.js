import {useState} from "react";

function ItemList({itemListData}) {
    // noinspection JSUnusedLocalSymbols
    const [itemData, setItemData] = useState(itemListData);
    const Items = itemData.map((item) => (
        <Item key={item.id} itemData={item}/>
    ));

    return (
        <div className="container">
            <div className="row">{Items}</div>
        </div>
    );
}

function Item({itemData}) {
    return (
        <div className="col-md-4">
            <div className="image-box">
                <img
                    className="image-thumbnail"
                    src={process.env.PUBLIC_URL + `./item${itemData.id + 1}.jpg`}
                    alt={itemData.title}
                />
            </div>
            <h4>{itemData.title}</h4>
            <p>{itemData.content}</p>
        </div>
    );
}

export default ItemList;
