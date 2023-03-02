import React, { Fragment } from 'react';
import Material from '../../assets/Material';
import { Content } from '../../app/Definitions';

export default function Header(props: { title: string, items: Array<Content>, id: string})
{
    return (
        <>
            <div className='block sm:hidden'>
                <DropDownHeader {...props} />
            </div>
            <div className='hidden sm:block'>
                <FullHeader {...props} />
            </div>
        </>
        
    )
}

function FullHeader(props: { title: string, items: Array<Content>, id: string }) {
    return (
        <div id={props.id} className='bg-[#242424] text-white py-[12px] flex justify-evenly w-full min-h-[48px] sticky top-0 z-10 shadow-md'>
            
            {
                props.items.map((headerItem, index) => {
                    return (
                        <Fragment key={headerItem.title}>

                            {Math.floor(props.items.length / 2) === index &&
                            <Material.Link
                                sx={{ marginTop: 'auto', color: 'white', fontSize: '32px' }}
                                href='/'
                                underline='hover'
                                color='primary'
                            >
                                Rafael
                                </Material.Link>}
                            
                            <Material.Link
                                sx={{ marginTop: 'auto', color: 'white', fontSize: '16px' }}
                                href={headerItem.content || ''}
                                underline='hover'
                                color='primary'
                            >
                                {headerItem.title}
                            </Material.Link>
                        </Fragment>
                    )
                })
            }
            
        </div>
    )
}

function DropDownHeader(props: { title: string, items: Array<Content>, id: string }) {
    const [menuToggle, setMenuToggle] = React.useState<boolean>(false);
    const [menuAnchor, setMenuAnchor] = React.useState<HTMLElement>();

    return (
        <div id={props.id} className='bg-[#242424] text-white py-[12px] flex justify-evenly w-full min-h-[48px] sticky top-0 z-10 shadow-md'>
            <Material.ClickAwayListener onClickAway={(() => setMenuToggle(false))}>
            <Material.Button
                sx={{color: 'white'}} 
                onClick={(e) => {
                    setMenuAnchor(e.target as HTMLElement);
                    setMenuToggle(true);
                }}
                startIcon={<Material.MenuIcon />}
            >
                <Material.Typography sx={{fontSize: '32px', fontFamily: 'inherit'}}>{props.title}</Material.Typography>
            </Material.Button>
            </Material.ClickAwayListener>

            <Material.Drawer
                open={menuToggle}
                anchor={'top'}
            >
            <Material.List
                sx={{ backgroundColor: '#242424' }}
            >
            {
                props.items.map((headerItem) => {
                    return (
                        <Material.ListItem key={headerItem.title} sx={{display: 'flex', justifyContent: 'center'}}>
                            <Material.Link
                                sx={{ color: 'white', marginTop: 'auto', fontSize: '16px' }}
                                href={headerItem.content || ''} underline='hover' color='primary'
                            >
                                <Material.ListItemText primary={headerItem.title} />
                                <Material.Divider />
                            </Material.Link>
                        </Material.ListItem>
                    )
                })
            }
            </Material.List>
            </Material.Drawer>      
        </div>
    )
}