package api;

import (
   "database/sql"
   "net/http"
   _ "github.com/go-sql-driver/mysql"
   "code.google.com/p/gorest"
   "fmt"
)

type Api struct {
   db sql.DB
   iface *ApiInterface

}

type CaptionResponse struct {
   Kind string `json:"kind"`
   Captions string `json:"captions"`
}
type RequestInfo struct {

}
type CommitInfo struct {
   Kind string `json:"kind"` //kind of work completed
   Data string `json:"data"` //data completed
}
type GetWorkResponse struct{
   Kind string `json:"kind"`
   Data string `json:"data"`
}
type ApiInterface struct {
   gorest.RestService `root:"/api/" consumes:"application/json" produces:"application/json"`

   getCaptions gorest.EndPoint `method:"GET" path:"/view/get/{uid:string}/{vid:string}" output:"CaptionResponse"`
   requestVideo gorest.EndPoint `method:"POST" path:"/view/request/{uid:string}/{vid:string}" postdata:"RequestInfo"`
   commitWork gorest.EndPoint `method:"POST" path:"/work/commit/{uid:string}/{vid:string}" postdata:"CommitInfo"`
   getWork gorest.EndPoint `method:"GET" path:"/work/get/{uid:string}/{vid:string}/{work_type:string}" output:"GetWorkResponse"`

}

func report(msg string){
   fmt.Println("# [LOG][API] "+msg);
}


func(serv ApiInterface) RequestVideo(i RequestInfo, uid string, vid string) {
   report("request video");
   
} 
func(serv ApiInterface) GetCaptions(uid string, vid string) (CaptionResponse){
   var c CaptionResponse;
   c.Kind = "raw";
   c.Captions = "FOOBAR";
   return c;
   //serv.ResponseBuilder().SetResponseCode(404).Overide(true)  
}
func(serv ApiInterface) CommitWork(i CommitInfo, uid string, vid string) {
   report("commit work");
   
} 
func(serv ApiInterface) GetWork(uid string, vid string, kind string) (GetWorkResponse) {
   var r GetWorkResponse;
   r.Kind  = "segment";
   r.Data = "FOOBAR";

   report("get work");
   return r;
}

func SetupAPI(prefix string) Api {
   var a Api;
   a.iface = new(ApiInterface);
   gorest.RegisterService(a.iface);
   gorest.RegisterMarshaller("application/json", gorest.NewJSONMarshaller())
   http.Handle(prefix, gorest.Handle());
   return a;
}




