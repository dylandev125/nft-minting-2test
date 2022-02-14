import './style.css'

const Pass = ( props ) => {
    return (
        <div className="pass-wrapper">

            <div className="pass-realm">
                <div className="title">
                    <h3>{props.children}</h3>
                </div>
            </div>
            <div className="btn-passMint">
                <button onClick={props.onClick}>Buy Pass</button>
            </div>
        </div>
    )
}

export default Pass;