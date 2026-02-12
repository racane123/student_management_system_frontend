import { useState } from "react";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

export default function Dashboard(){
    const [isOpen, setIsOpen] = useState(true);

    return(
        <div style = {{display: "flex"}}>

            <Sidebar
                isOpen={isOpen}
            />

            <div style={{flex: 1}}>
                <button className="btn-toggle" onClick={()=>
                    setIsOpen(!isOpen)
                }>☰</button>
            </div>
        </div>
    )
}

