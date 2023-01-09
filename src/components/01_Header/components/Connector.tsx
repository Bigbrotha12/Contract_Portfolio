import React from 'react';
import Material from '../../../assets/Material';

export default function Connector()
{
    const [modalState, setModalState] = React.useState(false);
    const handleModal = () =>
    {
        setModalState((state) => !state);
    }

    return (
        <div className='flex align-middle py-auto px-[32px]'>
            <Material.Button onClick={handleModal} variant='contained'>
                Connect
            </Material.Button>
            <Material.Modal
            open={modalState}
            onClose={handleModal}
            >
                <Material.Box sx={{position: 'absolute', boxShadow: 24, p: 4, top: '50%', left: '50%', transform: 'translate(-50%, -50%)'}}>
                    <Material.Typography variant="h6" component="h2">
                    Text in a modal
                    </Material.Typography>
                    <Material.Typography sx={{ mt: 2 }}>
                    Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
                    </Material.Typography>
                </Material.Box>
            </Material.Modal>
        </div>
    )
}