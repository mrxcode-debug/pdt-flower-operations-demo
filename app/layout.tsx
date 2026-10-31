import type {Metadata} from "next";
import "./globals.css";
import {Shell} from "../components/shell";
export const metadata:Metadata={title:"PDT Flower Operations | Demo",description:"Hệ điều hành điều hành nhà vườn"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="vi"><body><div className="public-demo-stamp">INTERNAL DEMO · SYNTHETIC DATA</div><Shell>{children}</Shell></body></html>}