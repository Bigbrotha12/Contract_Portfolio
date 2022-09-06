import { SetStateAction } from "react";
import { Grid, Item, Card, CardHeader, CardContent, Typography } from "../Material/Material";
import style from "../styling.module.css";

interface BodyProps {
    contractState: {},
    contractSetting: React.Dispatch<SetStateAction<{}>>
}

export default function Body(props: BodyProps) {

    return (
        <div className={style.bodyContainer}>
          <Grid className={style.bodyGrid} container spacing={4}>
            <Grid xs={4}>
                <Card>
                    <CardHeader title="This is Header" subheader="September 6, 2022" />
                    <CardContent>
                        <Typography>Content for card</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid xs={4}>
                <Card>
                    <CardHeader title="This is Header" subheader="September 6, 2022" />
                    <CardContent>
                        <Typography>Content for card</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid xs={4}>
                <Card>
                    <CardHeader title="This is Header" subheader="September 6, 2022" />
                    <CardContent>
                        <Typography>Content for card</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid xs={4}>
                <Card>
                    <CardHeader title="This is Header" subheader="September 6, 2022" />
                    <CardContent>
                        <Typography>Content for card</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid xs={4}>
                <Card>
                    <CardHeader title="This is Header" subheader="September 6, 2022" />
                    <CardContent>
                        <Typography>Content for card</Typography>
                    </CardContent>
                </Card>
            </Grid>
            <Grid xs={4}>
                <Card>
                    <CardHeader title="This is Header" subheader="September 6, 2022" />
                    <CardContent>
                        <Typography>Content for card</Typography>
                    </CardContent>
                </Card>
            </Grid>
          </Grid>  
        </div>
        
     );
}

