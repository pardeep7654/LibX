export const calculateFine=(dueDate)=>{
    const currentDate=new Date();
    const due=new Date(dueDate);
    const fineperhour=0.10;
    if(currentDate>due){
        const diffTime=Math.abs(currentDate-due);
        const diffHours=Math.ceil(diffTime/(1000*60*60));
        return diffHours*fineperhour;
    }
    return 0;
}