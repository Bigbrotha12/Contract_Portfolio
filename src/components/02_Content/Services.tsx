import React from 'react';
import Material from '../../assets/Material';

export default function Services()
{
    return (
        <div>
            <div id='TitleLabel' className='py-[48px] px-auto'>
                <Material.Typography sx={{ fontFamily: 'inherit', textAlign: 'center' }} variant='h3' >
                    I can help you with...
                </Material.Typography>
            </div>

            <div id='ServicesGrid'>
                <Material.Grid container sx={{margin: '0px', padding: '12px'} } spacing={4}>
                    <Material.Grid sm={6}>
                        <Material.Card>
                            <Material.CardHeader
                                avatar={<Material.Avatar sx={{ bgColor: 'red' }} />}
                                title="TITLE ONE"
                            />
                            <Material.CardContent>
                                <Material.Typography>
                                    ServiceOne Content
                                </Material.Typography>
                            </Material.CardContent>
                        </Material.Card>
                    </Material.Grid>
                    <Material.Grid sm={6}>
                        <Material.Card>
                            <Material.CardHeader
                                avatar={<Material.Avatar sx={{ bgColor: 'red' }} />}
                                title="TITLE ONE"
                            />
                            <Material.CardContent>
                                <Material.Typography>
                                    ServiceOne Content
                                </Material.Typography>
                            </Material.CardContent>
                        </Material.Card>
                    </Material.Grid>
                    <Material.Grid sm={6}>
                        <Material.Card>
                            <Material.CardHeader
                                avatar={<Material.Avatar sx={{ bgColor: 'red' }} />}
                                title="TITLE ONE"
                            />
                            <Material.CardContent>
                                <Material.Typography>
                                    ServiceOne Content
                                </Material.Typography>
                            </Material.CardContent>
                        </Material.Card>
                    </Material.Grid>
                </Material.Grid>
            </div>
        </div>
    )
}