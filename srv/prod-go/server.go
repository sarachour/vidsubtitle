package main;

import (
   "fmt"
   "net/http"
   "path/filepath"
   "./api"
)

type Action struct {
   Type string `json:"type"` //type of action 
   VideoId string `json:"video_id"` //video id
   UserId string `json:"user_id"` //user making request
   Payload string `json:"payload"` //payload associated with action
}

var api_inst api.Api;

func report(msg string){
   fmt.Println("# [LOG] "+msg);
}
func fail(err error){
   panic(err);
}




func server(){
   file_dir, _ := filepath.Abs(filepath.Dir("../../site/"));

   report("Starting HTTP Server");
   report(file_dir);

   http.Handle("/web/", http.StripPrefix("/web/", http.FileServer(http.Dir(file_dir) ) ) );
   api_inst = api.SetupAPI("/api/");
   http.ListenAndServe(":8080", nil);


   //err := http.ListenAndServeTLS(":4443", "cert.pem", "key.pem", nil);
   //if(err != nil){
   //   report("Error occurred");
   //}
}
func main(){
   server();
}