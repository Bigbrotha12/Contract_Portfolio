import { SetStateAction } from "react";

interface BodyProps {
    contractState: {},
    contractSetting: React.Dispatch<SetStateAction<{}>>
}

export default function Body(props: BodyProps) {

    return ( 
        <div>
            <p> This is the body</p>
        </div>
     );
}

