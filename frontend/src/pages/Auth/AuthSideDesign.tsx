import { Cpu, FileMinusCorner, Paperclip, StarsIcon } from 'lucide-react';


function AuthSideDesign() {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-15 p-10 bg-linear-to-br from-primary-200 via-secondary-200 to-royal-gold-200 rounded-lg"
      
    >
        {/*  uploaded and processsed document */}
      <div className="border border-border bg-background p-4 text-primary rounded-lg w-full max-w-md -rotate-5 hover:rotate-0 transition-transform duration-300">
        <div className="flex justify-between items-center mb-4">
        <div className="flex gap-2 items-center">
        <div className="rounded-sm bg-primary/15 p-3">
          <FileMinusCorner className="size-4 text-primary" />
        </div>
        <div className="flex flex-col ">
            <p className="text-bold text-lg">Q4_Financial_Report.pdf</p>
            <span className="text-sm text-muted-foreground">Processed: 2 mins ago</span>
        </div>
        </div>
        <div className="rounded-sm bg-secondary/20 px-4 py-0.5 ">
         <span className="text-xs font-medium text-secondary">Index</span>
        </div>
        </div>
        <div className='flex flex-col gap-2 animate-pulse'>

        <div className="h-2 bg-border rounded-full "></div>
        <div className="h-2 bg-border rounded-full w-50"></div>
        </div>
      </div>

      {/* retrieved context */}
      <div className="border border-border bg-background px-6 py-4 text-primary rounded-lg w-full max-w-md relative">
        <div className="flex gap-2 items-center mb-4">
            <Cpu size={20} className="text-muted-foreground" />
          <p className="text-bold text-lg">Retrieved Context</p>
        </div>
        <div className='flex gap-2 h-auto'>
        <div className="w-2 rounded-lg bg-primary"></div>
       
         <p className=" italic inline">"...revenue increased by 14% year-over-year in the APAC region, driven primarily by enterprise software subscriptions..."</p>
        </div>
        <div className="absolute -left-4 top-1/2 -translate-y-1/2 rounded-full bg-secondary-100 p-2">
            <Paperclip size={14} className="text-secondary" />
        </div>
      </div>

      {/* AI-generated answer */}
      <div className="w-full max-w-md rotate-5 rounded-lg bg-gray-900 p-4 text-primary transition-transform duration-300 hover:rotate-0">
        <div className="mb-4 flex items-center gap-2 text-primary">
            <StarsIcon size={20} className="text-primary" />
          <p className="text-bold text-lg">Synthesis</p>
        </div>
        <p className=" text-gray-400">
          Based on the Q4 report, the primary growth driver was a <span className="font-bold text-white text-lg">14% increase</span> in enterprise subscriptions within the APAC region.
        </p>
      </div>
    </div>
  );
}

export default AuthSideDesign;