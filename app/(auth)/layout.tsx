const AuthLayout = ({children}: { children: React.ReactNode }) => {
    return ( 
        <div className="bg-red-300 h-full">
            {children}
        </div>
    );
}
 
export default AuthLayout;