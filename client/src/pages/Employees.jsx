import { useEffect, useState } from "react"
import { dummyEmployeeData } from "../assets/assets"
import { Plus } from "lucide-react"


const Employees = () => {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchEmployees = useCallback(async () => {
    setLoading(true)
    setEmployees(dummyEmployeeData)
    setTimeout(() => {
      setLoading(false)
    })
  },[])

  useEffect(() => {
    fetchEmployees();
  })

  return (
    <div className="animate-fade-in">
        {/* ---- header ---- */}
        <div className="flex flex-col sm:flex-row justify-between
        items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="page-title">Employees</h1>
            <p className="page-subtitle">Manage your team members</p>
          </div>
          <button className="btn-primary flex items-center gap-2 w-full sm:w-auto justify-center">
            <Plus size={16}/> Add Employee
          </button>
        </div>
        {/*---- search bar ---- */}
        {/* ----- employee cards ----- */}
    </div>
  )
}

export default Employees