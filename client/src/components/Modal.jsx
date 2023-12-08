export function Modal({children, modalVisible, setModalVisible}) {

    return (
        <div onClick={() => setModalVisible(false)} className={"modal-bg absolute inset-0 flex justify-center items-center " + (modalVisible ? 'visible' : 'invisible')}>
            <div onClick={e => e.stopPropagation()} className="modal flex flex-wrap rounded-2xl p-5 w-2/4">
                {children}
            </div>
        </div>
    )
}