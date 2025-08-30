import Image from 'next/image';
import icon_akomoderate from '@/public/favicon.ico';
// import icon_akomoderate from '@/public/icon_akomoderate.png';

export const Icon ={
    icon_akomoderate: ({...props}) =>(
        <Image 
            src={icon_akomoderate.src} 
            alt="Hospital Icon" 
            width={50} 
            height={50}
            {...props}
        />
    ),
    hospital: ({...props}) =>(
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 16 16"
            {...props}
        >
        <path 
            fill="currentColor" 
            d="M15 4V0H8v4H0v12h6v-3h4v3h6V4h-1zM4 11H2V9h2v2zm0-3H2V6h2v2zm3 3H5V9h2v2zm0-3H5V6h2v2zm3-5V2h1V1h1v1h1v1h-1v1h-1V3h-1zm1 8H9V9h2v2zm0-3H9V6h2v2zm3 3h-2V9h2v2zm0-3h-2V6h2v2z"/
        >
        </svg>
    ),
    user: ({...props}) =>(
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="25" 
            height="25" 
            viewBox="0 0 24 24"
            {...props}
        ><path 
            fill="currentColor" 
            d="M12 2a3 3 0 0 1 3 3a3 3 0 0 1-3 3a3 3 0 0 1-3-3a3 3 0 0 1 3-3m8 16l-2-5.44c-.35-.99-.66-1.85-2-2.56c-1.38-.7-2.38-1-4-1c-1.63 0-2.62.3-4 1c-1.34.71-1.65 1.57-2 2.56L4 18c-.32 1.35 2.36 2.44 4.11 3.19V19c0-.95.86-1.62 2.58-2.03c.16-.04.31-.06.43-.08c-.54-.82-.76-1.55-.78-1.61l1.77-.6c.01.02.52 1.59 1.73 2.38c.21.07.42.15.62.24c.77.34 1.23.78 1.38 1.31c-1.34.53-2.62.8-3.84.8l-1-.1v2.63l1 .06c1.37 0 2.67-.28 3.89-.81c1.75-.75 4.36-2.06 4.11-3.19m-4.5-1a1.5 1.5 0 0 1-1.5-1.5a1.5 1.5 0 0 1 1.5-1.5a1.5 1.5 0 0 1 1.5 1.5a1.5 1.5 0 0 1-1.5 1.5Z"/>
        </svg>

    ),
    time: () =>(
        <svg xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 432 432"
        ><path 
            fill="currentColor" 
            d="M213.5 3q88.5 0 151 62.5T427 216t-62.5 150.5t-151 62.5t-151-62.5T0 216T62.5 65.5T213.5 3zm0 384q70.5 0 120.5-50t50-121t-50-121t-120.5-50T93 95T43 216t50 121t120.5 50zM224 109v112l96 57l-16 27l-112-68V109h32z"/>
        </svg>

    ),
    history: () =>(
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="30" 
            height="30" 
            viewBox="0 0 24 24"
        ><path 
            fill="currentColor" 
            d="M8.23 18.77q-.412 0-.705-.295q-.294-.293-.294-.706v-1.192q0-.343.232-.576q.232-.232.575-.232H10v-3.25q-.827.162-1.738-.005t-1.575-.73q-.133-.122-.21-.275q-.077-.153-.077-.334v-1.04H5.31q-.154 0-.297-.056t-.272-.185l-1.93-1.93q-.257-.256-.228-.599q.029-.342.31-.565q.724-.513 1.66-.764q.937-.251 1.847-.251q.961 0 1.87.273q.907.273 1.73.855v-.365q0-.615.428-1.043q.428-.428 1.043-.428h6.923q.662 0 1.134.474q.472.475.472 1.141V16.77q0 .846-.577 1.423q-.577.577-1.423.577H8.23Zm2.77-3h5.23q.31 0 .54.229q.23.23.23.54v.23q0 .425.288.713t.712.287q.425 0 .713-.287t.287-.713V6.692q0-.269-.173-.442t-.442-.173h-6.77q-.269 0-.442.173T11 6.692v.985l5.36 5.36q.118.111.144.253q.027.143-.037.285q-.063.142-.177.226q-.115.084-.292.084q-.102 0-.196-.043q-.093-.043-.156-.104l-2.896-2.896l-.565.566q-.293.292-.574.49q-.282.198-.611.348v3.523ZM5.408 9.134h1.184q.344 0 .576.232q.232.232.232.575v1.15q.512.316.952.43q.44.113.856.113q.682 0 1.241-.233t1.047-.721l.546-.546l-1.746-1.747q-.802-.801-1.798-1.202q-.996-.401-2.098-.401q-.73 0-1.421.19q-.69.19-1.237.494l1.666 1.666ZM16 16.769H8.23v1h8.074q-.171-.206-.238-.462Q16 17.051 16 16.77Zm-7.77 1v-1v1Z"/>
        </svg>

    ),
    schedule: () =>(
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="25" 
            height="25" 
            viewBox="0 0 24 24"
        ><path 
            fill="currentColor" 
            d="M12 14a1 1 0 1 0-1-1a1 1 0 0 0 1 1Zm5 0a1 1 0 1 0-1-1a1 1 0 0 0 1 1Zm-5 4a1 1 0 1 0-1-1a1 1 0 0 0 1 1Zm5 0a1 1 0 1 0-1-1a1 1 0 0 0 1 1ZM7 14a1 1 0 1 0-1-1a1 1 0 0 0 1 1ZM19 4h-1V3a1 1 0 0 0-2 0v1H8V3a1 1 0 0 0-2 0v1H5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h14a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3Zm1 15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-9h16Zm0-11H4V7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1ZM7 18a1 1 0 1 0-1-1a1 1 0 0 0 1 1Z"/>
        </svg>

    ),
    right: () =>(
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 48 48"
        ><path 
            fill="none" 
            stroke="#000" 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="4" 
            d="M19 12L31 24L19 36"/>
        </svg>
    ),
    left: () =>(
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 48 48"
        ><path 
            fill="none" 
            stroke="#000" 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="4" 
            d="M31 36L19 24L31 12"/>
        </svg>
    ),
    akomoderate: () =>(
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            width="20" 
            height="20" 
            viewBox="0 0 48 48"
        ><path 
            fill="none" 
            stroke="#000" 
            stroke-linecap="round" 
            stroke-linejoin="round" 
            stroke-width="4" 
            d="M31 36L19 24L31 12"/>
        </svg>
    ),
}