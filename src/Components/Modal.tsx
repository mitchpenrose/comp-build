import Modal from 'react-modal'
import { ReactComponent as CloseIcon } from '../icons/close.svg'

interface Props {
    isOpen: boolean,
    onClose: () => void,
    title: string
    children?: React.ReactNode
    height?: string
}

Modal.setAppElement('#root')

const Mod = ({ isOpen, onClose, children, title, height="500px" }: Props) => {
    return <Modal isOpen={isOpen} style={{
        content: {
            width: "512px",
            height: height,
            margin: "auto",
            background: "#282c34",
            border: "none"
        },
        overlay: {
            backgroundColor: "rgba(255, 255, 255, 0.25)"
        },
    }} onRequestClose={onClose}>
        <div style={{ position: "relative" }}>
            <div style={{ textAlign: "center", marginBottom: "15px", fontSize: "larger" }}>{title}
                <CloseIcon width={35} height={35} onClick={onClose} cursor={"pointer"} style={{ float: "right", position: "absolute", top: "-15px", right: "-15px" }} />
            </div>
        </div>
        {children}
    </Modal>
}

export default Mod