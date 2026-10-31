export type Greenhouse={id:string;sku:string;name:string;crop:string;stage:string;harvest:string;forecast:number;health:number;risk:"good"|"watch"|"high";note:string};
export type DemoOrder={id:string;sku:string;buyer:string;item:string;qty:number;dueOn:string;value:number};
export type DemoHarvest={id:string;sku:string;crop:string;greenhouse:string;availableOn:string;forecast:number;confirmedAvailable:number};

export const greenhouses:Greenhouse[]=[
{id:"A1",sku:"rose-red-naomi",name:"Nhà kính A1",crop:"Hoa hồng Red Naomi",stage:"Sắp thu",harvest:"24/09",forecast:1280,health:82,risk:"high",note:"Thiếu 180 cành cho đơn đã chốt"},
{id:"B2",sku:"chrysanthemum-pompon",name:"Nhà kính B2",crop:"Cúc mẫu đơn",stage:"Sinh trưởng",harvest:"02/10",forecast:940,health:94,risk:"good",note:"Đúng kế hoạch"},
{id:"C1",sku:"carnation",name:"Nhà kính C1",crop:"Cẩm chướng",stage:"Ra nụ",harvest:"28/09",forecast:760,health:76,risk:"watch",note:"Theo dõi tưới chiều nay"}];

export const orders:DemoOrder[]=[
{id:"O-2409-01",sku:"rose-red-naomi",buyer:"Hoa Đà Lạt Minh Anh",item:"Red Naomi",qty:900,dueOn:"2026-09-24",value:7650000},
{id:"O-2909-02",sku:"carnation",buyer:"Shop Hoa Mộc",item:"Cẩm chướng",qty:500,dueOn:"2026-09-29",value:3250000}];

export const harvests:DemoHarvest[]=[
{id:"H-A1-2409",sku:"rose-red-naomi",crop:"Red Naomi",greenhouse:"A1",availableOn:"2026-09-24",forecast:1280,confirmedAvailable:720},
{id:"H-C1-2809",sku:"carnation",crop:"Cẩm chướng",greenhouse:"C1",availableOn:"2026-09-28",forecast:760,confirmedAvailable:760},
{id:"H-B2-0210",sku:"chrysanthemum-pompon",crop:"Cúc mẫu đơn",greenhouse:"B2",availableOn:"2026-10-02",forecast:940,confirmedAvailable:940}];

export const tasks=[
{title:"Chốt nguồn bù Red Naomi",detail:"Thiếu 180 cành cho đơn 24/09",priority:"Ưu tiên cao"},
{title:"Kiểm tra tưới C1",detail:"Đánh giá độ ẩm lúc 15:00",priority:"Theo dõi"},
{title:"Xác nhận lịch cắt B2",detail:"Chuẩn bị đội thu hoạch",priority:"Kế hoạch"}];

export const money=(n:number)=>new Intl.NumberFormat("vi-VN",{style:"currency",currency:"VND",maximumFractionDigits:0}).format(n);
