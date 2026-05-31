
import { RouterProvider } from 'react-router-dom'
import { router } from './routes'
import { Toaster } from 'sonner'
function App() {

  return (
    <>
      <RouterProvider router={router}/>
      <Toaster position="bottom-right" richColors closeButton />
    </>
    )
}

export default App
