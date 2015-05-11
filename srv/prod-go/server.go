package main;

import (
   "fmt"
   "net/http"
   "io"
   "path/filepath"
)
func report(msg string){
   fmt.Println("# [SRV] "+msg);
}


func apihost(w http.ResponseWriter, r *http.Request) {
   io.WriteString(w, "Hello world!")
}

func server(){
   file_dir, _ := filepath.Abs(filepath.Dir("../../site/"));

   report("Starting HTTP Server");
   report(file_dir);
   http.Handle("/web/", http.StripPrefix("/web/", http.FileServer(http.Dir(file_dir) ) ) );
   http.HandleFunc("/api/",apihost);
   http.ListenAndServe(":8080", nil);


   //err := http.ListenAndServeTLS(":4443", "cert.pem", "key.pem", nil);
   //if(err != nil){
   //   report("Error occurred");
   //}
}
func main(){
   server();
}