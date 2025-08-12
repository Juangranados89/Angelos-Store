import "./globals.css";import Link from "next/link";
export const metadata={title:"ANGELOS Admin"};
export default function RootLayout({children}:{children:React.ReactNode}){
  return(<html lang="es"><body>
    <header className="card" style={{borderRadius:0}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>ANGELOS — Admin</div>
        <nav style={{display:"flex",gap:"12px"}}>
          <Link href="/">Panel</Link>
          <Link href="/products">Productos</Link>
          <Link href="/purchases/new">Compras</Link>
          <Link href="/sales/new">Ventas</Link>
          <Link href="/reports/kardex">Kardex</Link>
        </nav>
      </div>
    </header>
    <main style={{maxWidth:960,margin:"0 auto",padding:"16px"}}>{children}</main>
  </body></html>)
}
