Write-Host "Installing backend packages..."
Set-Location -Path "backend"
npm install express bcrypt better-sqlite3 cors express-validator nodemon
Set-Location -Path ".."

Write-Host "Installing frontend packages..."
Set-Location -Path "frontend"
npm install @hookform/resolvers @radix-ui/react-label @radix-ui/react-slot @radix-ui/react-toast axios class-variance-authority clsx lucide-react react-hook-form tailwind-merge tailwindcss-animate zod
npm install -D @types/node autoprefixer postcss tailwindcss
Set-Location -Path ".."
