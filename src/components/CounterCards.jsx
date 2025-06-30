import { Link } from "react-router-dom";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

export default function CounterCards(props) {
  return (
    // <Card className="transition-all duration-500 hover:border-primary hover:drop-shadow-md border-2">
    //   <CardHeader>
    //     <div className="flex justify-between items-center">
    //       <div className="bg-primary-foreground rounded-full">
    //         <CardDescription className="text-primary flex justify-center items-center size-10 p-2">
    //           {props.logo}
    //         </CardDescription>
    //       </div>
    //       <CardTitle className="text-3xl sm:text-3xl font-semibold tracking-tight">
    //         {props.count}
    //       </CardTitle>
    //     </div>
    //   </CardHeader>
    //   <CardContent>{props.title}</CardContent>
    // </Card>
    <div className="bg-white p-6 h-full flex flex-col justify-center items-start rounded-xl">
      <Link to={props.link || "#"} className="w-full">
        <div className="flex justify-between items-center w-full">
          <p className="text-muted-foreground">{props.title}</p>
          <div className="bg-primary-foreground rounded-full">
            <p className="text-primary flex justify-center items-center size-10 p-2">
              {props.logo}
            </p>
          </div>
        </div>
        <h1 className="text-3xl sm:text-3xl font-semibold tracking-tight">
          {props.count}
        </h1>
      </Link>
    </div>
  );
}
