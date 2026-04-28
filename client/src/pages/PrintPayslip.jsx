import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom"
import Loading from "../components/Loading";
import { format } from "date-fns";
import api from "../api/axios";
import { DownloadIcon, PrinterIcon } from "lucide-react";

const PrintPayslip = () => {
  const {id} = useParams();
  const [payslip, setPayslip] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    api.get(`/payslips/${id}`)
      .then((res) => setPayslip(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  },[id])

  const handleDownload = () => {
    // Set document title so the PDF filename is meaningful
    const originalTitle = document.title
    document.title = `Payslip_${payslip.employee?.firstName}_${payslip.employee?.lastName}_${format(new Date(payslip.year, payslip.month - 1), "MMM_yyyy")}`
    
    window.print()
    
    // Restore title after print dialog closes
    setTimeout(() => {
      document.title = originalTitle
    }, 1000)
  }

  if (loading) return <Loading/>
  if (!payslip) return <p className="text-center py-12 text-slate-400">Payslip not found</p>

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #payslip-content, #payslip-content * { visibility: visible; }
          #payslip-content {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            padding: 40px;
            background: white;
          }
          .print-hidden { display: none !important; }
          * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      <div className="min-h-screen bg-slate-50 p-6">
        {/* Action buttons */}
        <div className="max-w-2xl mx-auto mb-4 flex gap-3 print-hidden">
          <button
            onClick={handleDownload}
            className="btn-primary flex items-center gap-2"
          >
            <DownloadIcon className="w-4 h-4"/>
            Download PDF
          </button>
          <button
            onClick={() => window.print()}
            className="btn-secondary flex items-center gap-2"
          >
            <PrinterIcon className="w-4 h-4"/>
            Print
          </button>
        </div>

        {/* Payslip content */}
        <div id="payslip-content" className="max-w-2xl mx-auto p-8 bg-white shadow-sm rounded-2xl">
          
          {/* Header */}
          <div className="text-center border-b border-slate-200 pb-6 mb-8">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">PAYSLIP</h1>
            <p className="text-slate-500 text-sm mt-1">
              {format(new Date(payslip.year, payslip.month - 1), "MMMM yyyy")}
            </p>
          </div>

          {/* Employee details */}
          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p style={{fontSize:'11px', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'4px'}}>Employee Name</p>
              <p style={{fontWeight:600, color:'#0f172a'}}>
                {payslip.employee?.firstName} {payslip.employee?.lastName}
              </p>
            </div>
            <div>
              <p style={{fontSize:'11px', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'4px'}}>Position</p>
              <p style={{fontWeight:600, color:'#0f172a'}}>{payslip.employee?.position}</p>
            </div>
            <div>
              <p style={{fontSize:'11px', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'4px'}}>Email</p>
              <p style={{fontWeight:600, color:'#0f172a'}}>{payslip.employee?.email}</p>
            </div>
            <div>
              <p style={{fontSize:'11px', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'4px'}}>Period</p>
              <p style={{fontWeight:600, color:'#0f172a'}}>
                {format(new Date(payslip.year, payslip.month - 1), "MMMM yyyy")}
              </p>
            </div>
          </div>

          {/* Salary table */}
          <div style={{border:'1px solid #e2e8f0', borderRadius:'12px', overflow:'hidden', marginBottom:'32px'}}>
            <table style={{width:'100%', fontSize:'14px', borderCollapse:'collapse'}}>
              <thead>
                <tr style={{background:'#f8fafc'}}>
                  <th style={{textAlign:'left', padding:'12px 16px', fontSize:'11px', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                    Description
                  </th>
                  <th style={{textAlign:'right', padding:'12px 16px', fontSize:'11px', color:'#94a3b8', textTransform:'uppercase', letterSpacing:'0.05em'}}>
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr style={{borderTop:'1px solid #f1f5f9'}}>
                  <td style={{padding:'12px 16px', color:'#475569'}}>Basic Salary</td>
                  <td style={{textAlign:'right', padding:'12px 16px', color:'#0f172a', fontWeight:500}}>
                    ${payslip.basicSalary?.toLocaleString()}
                  </td>
                </tr>
                <tr style={{borderTop:'1px solid #f1f5f9'}}>
                  <td style={{padding:'12px 16px', color:'#475569'}}>Allowances</td>
                  <td style={{textAlign:'right', padding:'12px 16px', color:'#0f172a', fontWeight:500}}>
                    +${payslip.allowances?.toLocaleString()}
                  </td>
                </tr>
                <tr style={{borderTop:'1px solid #f1f5f9'}}>
                  <td style={{padding:'12px 16px', color:'#475569'}}>Deductions</td>
                  <td style={{textAlign:'right', padding:'12px 16px', color:'#0f172a', fontWeight:500}}>
                    -${payslip.deductions?.toLocaleString()}
                  </td>
                </tr>
                <tr style={{borderTop:'2px solid #e2e8f0', background:'#f8fafc'}}>
                  <td style={{padding:'16px', color:'#0f172a', fontWeight:600}}>Net Salary</td>
                  <td style={{textAlign:'right', padding:'12px 16px', color:'#0f172a', fontWeight:700, fontSize:'18px'}}>
                    ${payslip.netSalary?.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{textAlign:'center', fontSize:'12px', color:'#94a3b8', marginTop:'32px', paddingTop:'16px', borderTop:'1px solid #f1f5f9'}}>
            <p>This is a computer-generated payslip and does not require a signature.</p>
            <p style={{marginTop:'4px'}}>Generated on {format(new Date(), "dd MMM yyyy")}</p>
          </div>
        </div>
      </div>
    </>
  )
}

export default PrintPayslip