package api;

import (
   "database/sql"
    _ "github.com/mattn/go-sqlite3"
   "net/http"
   "code.google.com/p/gorest"
   "fmt"
   "encoding/json"
   "os/exec"
   "os"
)

type Api struct {
   db *sql.DB
   iface *ApiInterface
}

/*
Core structs
*/
type CaptionStruct struct {
   Speakers map[string]string `json:"captions"`
   Start int `json:"start"`
   End int `json:"end"`
}
type VideoDataStruct struct {
   Data []CaptionStruct `json:"data"`
   URL string `json:"url"`
}

/*
postdata objects
*/
type ApiRequestInfo struct {

}
type ApiCommitInfo struct {
   Kind string `json:"kind"` //kind of work completed
   Data VideoDataStruct `json:"data"` //data completed
}

/*
Response objects
*/
type ApiGetWorkResponse struct{
   Kind string `json:"kind"`
   Data VideoDataStruct `json:"data"`
}
/* API Structurs */
type ApiCaptionResponse struct {
   Kind string `json:"kind"`
   Data VideoDataStruct `json:"captions"`
}
type StatusResponse struct {
   Message string `json:"msg"`
}
type ListVideoResponse struct{
   Data string `json:"data"`
   Id string `json:"id"`
   Captions string `json:"captions"`
   Stage string `json:"stage"`
}
type ListUserResponse struct{
   Id string `json:"id"`
}
type ListTurkerResponse struct{
   Id string `json:"id"`
}
type ListRequestResponse struct{
   UserId string `json:"user_id"`
   VideoId string `json:"video_id"`
}
type ListWorkResponse struct{
   TurkerId string `json:"turker_id"`
   VideoId string `json:"video_id"`
   Stage string `json:"stage"`
}

/*
Interface
*/
type ApiInterface struct {
   gorest.RestService `root:"/api/" consumes:"application/json" produces:"application/json"`
   registerUser gorest.EndPoint `method:"POST" path:"/register/user/{uid:string}" postdata:"string"`
   registerTurker gorest.EndPoint `method:"POST" path:"/register/turker/{uid:string}" postdata:"string"`

   listVideos gorest.EndPoint `method:"GET" path:"/view/list/videos" output:"[]ListVideoResponse"`
   listUsers gorest.EndPoint `method:"GET" path:"/view/list/users" output:"[]ListUserResponse"`
   listTurkers gorest.EndPoint `method:"GET" path:"/view/list/turker" output:"[]ListTurkerResponse"`
   listRequests gorest.EndPoint `method:"GET" path:"/view/list/requests" output:"[]ListRequestResponse"`
   listWork gorest.EndPoint `method:"GET" path:"/view/list/work" output:"[]ListWorkResponse"`
   
   //get things from server
   getCaptions gorest.EndPoint `method:"GET" path:"/view/get/{uid:string}/{vid:string}" output:"ApiCaptionResponse"`
   getWork gorest.EndPoint `method:"GET" path:"/work/get/{uid:string}/{vid:string}/{work_type:string}" output:"ApiGetWorkResponse"`
   
   //push to server
   requestVideo gorest.EndPoint `method:"POST" path:"/view/request/{uid:string}/{vid:string}" postdata:"ApiRequestInfo"`
   commitWork gorest.EndPoint `method:"POST" path:"/work/commit/{uid:string}/{vid:string}" postdata:"ApiCommitInfo"`

   api_handle *Api
}

type DBTurker struct {
   id sql.NullString
}
type DBUser struct {
   id sql.NullString
}
type DBRequest struct {
   user_id sql.NullString
   video_id sql.NullString
}

//turker id, video id 
type DBWork struct {
   turker_id sql.NullString
   video_id sql.NullString
   stage sql.NullString   
}

type DBVideo struct {
   id sql.NullString //the id of the video
   stage sql.NullString //the stage of the video
   data sql.NullString
}

var api_handle *Api;
func report(msg string){
   fmt.Println("# [LOG][API] "+msg);
}

func rslv_nstr(s sql.NullString) string{
   if s.Valid {return s.String;}
   return "null";
}
func serialize_data(s VideoDataStruct) string{
   str,err := json.Marshal(s);
   if err != nil {panic(err)}
   return string(str);
}
func deserialize_data(s string) (VideoDataStruct){
   var data VideoDataStruct;
   byt := []byte(s);
   err := json.Unmarshal(byt, &data);
   if err != nil {panic(err)}
   return data;
}
func snd_post_resp(serv *ApiInterface, data interface{}){
   rb := serv.ResponseBuilder()
   rb.AddHeader("Content-Type", "application/json")
   str,err := json.Marshal(data);
   if err != nil {panic(err)}
   rb.Write([]byte(str))
}
func snd_err_resp(serv *ApiInterface, data interface{}){
   rb := serv.ResponseBuilder()
   rb.AddHeader("Content-Type", "application/json")
   str,err := json.Marshal(data);
   if err != nil {panic(err)}
   rb.Write([]byte(str))
}
func dl_video(vid string) string{
   var url = "https://www.youtube.com/watch?v="+vid;
   var media_root = "../../site/media/youtube/";
   var media_file = vid + ".mp4";
   var ofile = media_root + media_file;
   var ourl = "web/media/youtube/"+media_file;
   cmd := exec.Command("youtube-dl", "-o", ofile, url);
   cmd.Stdin = os.Stdin;
   cmd.Stdout = os.Stdout;
   cmd.Stderr = os.Stderr;

   err := cmd.Run();
   if(err != nil){
      fmt.Printf("%v\n", err)
   }
   return ourl;
}
func(serv ApiInterface) ListVideos() ([]ListVideoResponse){
   l := make([]ListVideoResponse,0);

   var db = api_handle.db;
   rows,err := db.Query("select * from Videos");
   if err != nil {panic(err)}
   defer rows.Close();
   for rows.Next(){
      var vr DBVideo;
      var elem ListVideoResponse;
      if err := rows.Scan(&vr.id, &vr.stage, &vr.data); err != nil { panic(err);}
      elem.Id = rslv_nstr(vr.id);
      elem.Stage = rslv_nstr(vr.stage);
      elem.Data = rslv_nstr(vr.data);
      l = append(l,elem);
   }
   return l;
}

func(serv ApiInterface) ListUsers() ([]ListUserResponse){
   l := make([]ListUserResponse,0);
   var db = api_handle.db;
   rows,err := db.Query("select * from Users");
   if err != nil {panic(err)}
   defer rows.Close();
   for rows.Next(){
      var vr DBUser;
      var elem ListUserResponse;
      if err := rows.Scan(&vr.id); err != nil { panic(err);}
      elem.Id = rslv_nstr(vr.id);
      l = append(l,elem);
   } 
   return l;
}

func(serv ApiInterface) ListTurkers() ([]ListTurkerResponse){
   l := make([]ListTurkerResponse,0);
   var db = api_handle.db;
   rows,err := db.Query("select * from Turkers");
   if err != nil {panic(err)}
   defer rows.Close();
   for rows.Next(){
      var vr DBTurker;
      var elem ListTurkerResponse;
      if err := rows.Scan(&vr.id); err != nil { panic(err);}
      elem.Id = rslv_nstr(vr.id);
      l = append(l,elem);
   } 
   return l;
}


func(serv ApiInterface) ListRequests() ([]ListRequestResponse){
   l := make([]ListRequestResponse,0);
   var db = api_handle.db;
   rows,err := db.Query("select video_id, user_id from Requests");
   if err != nil {panic(err)}
   defer rows.Close();
   for rows.Next(){
      var vr DBRequest;
      var elem ListRequestResponse;
      if err := rows.Scan(&vr.video_id, &vr.user_id); err != nil { panic(err);}
      elem.VideoId = rslv_nstr(vr.video_id);
      elem.UserId = rslv_nstr(vr.user_id);
      l = append(l,elem);
   } 
   return l;
}

func(serv ApiInterface) ListWork() ([]ListWorkResponse){
   l := make([]ListWorkResponse,0);
   var db = api_handle.db;
   rows,err := db.Query("select (video_id, turker_id, stage) from Work");
   if err != nil {panic(err)}
   defer rows.Close();
   for rows.Next(){
      var vr DBWork;
      var elem ListWorkResponse;
      if err := rows.Scan(&vr.video_id, &vr.turker_id, &vr.stage); err != nil { panic(err);}
      elem.VideoId = rslv_nstr(vr.video_id);
      elem.TurkerId = rslv_nstr(vr.turker_id);
      elem.Stage = rslv_nstr(vr.stage);
      l = append(l,elem);
   }
   return l;
}

func(serv ApiInterface) RequestVideo(i ApiRequestInfo, uid string, vid string) {
   var db = api_handle.db;
   var resp StatusResponse;
   //find the video.
   rows,err := db.Query("select * from Videos where id = ?",vid)
   if err != nil {panic(err)}
   defer rows.Close();

   //test if this request already exists

   defer rows.Close();
   if !rows.Next(){
      resp.Message = "first time request. inserting video request into database.";
      var vstruct VideoDataStruct;
      var vstruct_str string;
      vstruct.URL = dl_video(vid);
      vstruct_str = serialize_data(vstruct);
      if _,err := db.Exec("INSERT INTO Videos(id, stage,data) values(?,?,?);", vid, "pending",vstruct_str); err != nil {panic(err)}
   } else {
      resp.Message = "logging user request for video.";
   }
   //insert request 
   db.Exec("INSERT INTO Requests(user_id, video_id) values(?,?);", uid,vid);
   
   
   snd_post_resp(&serv,resp);
} 
func(serv ApiInterface) RegisterUser(i string, uid string){
   var db = api_handle.db;
   var ur DBUser;
   var resp StatusResponse;
   //find the video.
   rows,err := db.Query("select * from Users where id = ?",uid)
   if err != nil {panic(err)}
   //test if this request already exists

   defer rows.Close();
   if !rows.Next(){
      report("Inserting user: "+ uid + "/" + ur.id.String);
      resp.Message = "successfully inserted user";
      if _,err := db.Exec("INSERT INTO Users(id) values(?);", uid); err != nil {panic(err)}
   } else {
      resp.Message = "user already exists";
   }
   
   snd_post_resp(&serv,resp);

   //serv.ResponseBuilder().SetResponseCode(404).Overide(true)  
}
func(serv ApiInterface) RegisterTurker(i string, tid string){
   var db = api_handle.db;
   var ur DBTurker;
   var resp StatusResponse;
   //find the video.
   rows,err := db.Query("select * from Users where id = ?",tid)
   if err != nil {panic(err)}
   defer rows.Close();
   //test if this request already exists
   if err := rows.Scan(&ur.id); err == nil {
      //insert 
      report("Inserting turker: "+ tid)
      resp.Message = "successfully inserted turker";
      if _,err := db.Exec("INSERT INTO Users(id) values(?);", tid); err != nil {panic(err)}
   }
   snd_post_resp(&serv,resp);
}
func(serv ApiInterface) GetCaptions(uid string, vid string) (ApiCaptionResponse){
   var db = api_handle.db;
   var elem ApiCaptionResponse;
   var resp StatusResponse;

   rows,err := db.Query("SELECT id,stage,data from Videos where id = ?",vid)
   if err != nil {panic(err)}

   defer rows.Close();
   if rows.Next(){
      var vr DBVideo;
      if err := rows.Scan(&vr.id, &vr.stage, &vr.data); err != nil { panic(err); }
      elem.Kind = rslv_nstr(vr.stage);
      elem.Data = deserialize_data(rslv_nstr(vr.data));
     
   } else{
      resp.Message = "captions do not exist";
      snd_err_resp(&serv,resp);
   }
   return elem;
   //serv.ResponseBuilder().SetResponseCode(404).Overide(true)  
}
func(serv ApiInterface) CommitWork(i ApiCommitInfo, tid string, vid string) {
   var db = api_handle.db;
   //UPDATE table1 set v1 = '$v1', v2 = '$v2', v3 = '$v3', v4 = '$v4' WHERE id = 1
   var dat_str = serialize_data(i.Data);
   //update work
   if _,err := db.Exec("UPDATE Videos set data = ? WHERE id = ?;", dat_str, vid); err != nil {
      panic(err);
   }
   //insert work
   db.Exec("INSERT INTO Work(video_id, turker_id, stage) values(?,?,?);", vid, tid, i.Kind);
   
} 
func(serv ApiInterface) GetWork(tid string, vid string, kind string) (ApiGetWorkResponse) {
   var db = api_handle.db;
   var elem ApiGetWorkResponse;
   var resp StatusResponse;

   var get_kind = func() string{
      switch kind{
         case "segment": return "WHERE stage = 'pending'";
         case "scribe": return "WHERE stage = 'segment'";
         case "edit": return "WHERE stage = 'scribe'";
         case "any": return "WHERE stage <> 'done'"
      }
      return "";
   }
   rows, err := db.Query("SELECT id,stage,data FROM Videos "+get_kind()+";");
   if err != nil {panic(err)}
   
   defer rows.Close();
   if rows.Next(){
      var vr DBVideo;
      if err := rows.Scan(&vr.id, &vr.stage, &vr.data); err != nil { panic(err); }
      elem.Kind = rslv_nstr(vr.stage);
      elem.Data = deserialize_data(rslv_nstr(vr.data));
     
   } else{
      resp.Message = "no work of that kind.";
      snd_err_resp(&serv,resp);
   }
   return elem;
}

/*
Sets up the database.
*/
func setupDB() *sql.DB{
   db, err := sql.Open("sqlite3", "./db/hs.db");
   if err != nil {
      panic(err);
   }
   //test if db is alive
   if err := db.Ping(); err != nil {panic(err);}
   if _, err := db.Begin(); err != nil {panic(err);}

   if _, err := db.Exec(`
         DROP TABLE IF EXISTS  Users;
         DROP TABLE IF EXISTS  Turkers;
         DROP TABLE IF EXISTS Videos;
         DROP TABLE IF EXISTS Requests;
         DROP TABLE IF EXISTS Work;
         `); err != nil {panic(err);}


   if _, err := db.Exec(`
         CREATE TABLE IF NOT EXISTS Users 
         ( 
            id STRING PRIMARY KEY 
         );`); err != nil {panic(err);}

   if _, err := db.Exec(`
         CREATE TABLE IF NOT EXISTS Turkers 
         ( 
            id STRING PRIMARY KEY 
         );`); err != nil {panic(err);}

   if _, err := db.Exec(`PRAGMA foreign_keys = ON;`); err != nil {panic(err);}


   if _, err := db.Exec(`
         CREATE TABLE IF NOT EXISTS Videos 
         ( 
            id STRING PRIMARY KEY,
            stage STRING,
            data STRING
         );`); err != nil {panic(err);}

   if _, err := db.Exec(`
         CREATE TABLE IF NOT EXISTS Requests 
         ( 
            user_id STRING,
            video_id STRING,
            PRIMARY KEY (user_id, video_id),
            FOREIGN KEY(user_id) REFERENCES Users(id) ON UPDATE CASCADE,
            FOREIGN KEY(video_id) REFERENCES Videos(id) ON UPDATE CASCADE
         );`); err != nil {panic(err);}

   if _, err := db.Exec(`
         CREATE TABLE IF NOT EXISTS Work 
         ( 
            stage string, 
            turker_id STRING,
            video_id STRING,
            PRIMARY KEY (turker_id, video_id),
            FOREIGN KEY(turker_id) REFERENCES Turkers(id) ON UPDATE CASCADE,
            FOREIGN KEY(video_id) REFERENCES Videos(id) ON UPDATE CASCADE
         );`); err != nil {panic(err);}


   return db;
}
func SetupAPI(prefix string) {
   var a = new(Api);
   a.db = setupDB();
   a.iface = new(ApiInterface);
   api_handle = a;

   gorest.RegisterService(a.iface);
   gorest.RegisterMarshaller("application/json", gorest.NewJSONMarshaller())
   http.Handle(prefix, gorest.Handle());

}




