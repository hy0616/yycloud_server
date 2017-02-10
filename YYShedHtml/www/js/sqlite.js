/** 
*数据库操作辅助类,定义对象、数据操作方法都在这里定义 
*/  
var dbname='mydb';  
var version='1.1';  
var dbdesc='RXA_DB';  
  
var table_collect='info_collect';

var dbsize=30000;  
var db=null;  
  
/** 
 * 打开数据库 
 * @returns {Boolean} 
 */  
function openDB(callback){  
    try{  
         if (!window.openDatabase) {  
             console.log('该浏览器不支持数据库');  
             return false;  
         }   
        db = window.openDatabase(dbname, version, dbdesc, dbsize);  
        return true;  
    }catch(e){  
        if(e==2){  
            console.log("数据库版本无效");  
        }else{  
            console.log("未知错误 "+e+".");  
        }  
        return false;  
    }  
}  
  
/** 
 * 执行一段sql 
 * @param sql 
 */  
function execSql(sql,param,callback){  
    if(db==null){openDB();}  
    db.transaction(function(tx) {  
        tx.executeSql(sql, param, function(tx, result) {
            if(typeof(callback) == 'function') {callback(true)}  
            return true;  
        }, function(tx, error) {  
            if(typeof(callback) == 'function') {callback(false)}  
            console.log(error);  
            return false;  
        });  
    });  
}  
  
var pictureFields=[  
   'id',                  
   'app_flow_no',  
   'ptr_type',  
   'ptr_name',  
   'ptr_address',  
   'blurred',  
   'original',  
   'local_address'  
  ]  
  
/** 
 * 初始化数据库 
 */  
/*function initDB(){  
    if(db==null){openDB();}  
    createTable(table_picture,pictureFields,{"id":"primary key","app_flow_no":"not null"});  
}*/ 
  
/** 
 * 创建数据库 
 * @param tableName     表名称 
 * @param fields        表字段 
 * @param constraint    约束或者字段的其他补充，可以为空, 
 *  格式如：{"id":"integer primary key autoincrement","app_flow_no":"not null"} 
 */  
function createTable(tableName,fields,constraint){  
    if(db==null){openDB();}
    var sql = 'CREATE TABLE IF NOT EXISTS '+tableName+' (';  
    for(i in fields){  
        var key = "";  
        if(typeof(constraint)!="undefined" && typeof(constraint[fields[i]]) !="undefined"){  
            key = " "+constraint[fields[i]];  
        }  
        sql+=fields[i]+key+",";  
    }  
    sql = sql.substr(0,sql.length-1);  
    sql += ")";  
    db.transaction(function CreateDB(tx) {tx.executeSql(sql);},
    		function(tx, result) {
		        if(typeof(callback) == 'function') {callback(true)}  
		        return true;  
		    }, function(tx, error) {  
		        if(typeof(callback) == 'function') {callback(false)}  
		        console.log(error);  
		        return false;  
		    });
}  
  
  
/** 
 * 更新数据 
 * @param tableName 表名称 
 * @param setFields 要更新的字段数组 
 * @param setParams 要更新的字段对应的参数数组 
 * @param whereStr  where语句，如果没有可不传，不包含where关键字，参数用?代替，如：id=? and name=? 
 * @param wherParams    where语句用到的参数数组,如['111','2222'] 
 */  
function updateTable(tableName,setFields,setParams,whereStr,wherParams){  
    var sql = "update "+tableName+" set ";  
    for(i in setFields){  
        sql+=setFields[i]+"=?,";  
    }  
    sql = sql.substr(0,sql.length-1);  
    if(typeof(whereStr)!="undefined" && typeof(wherParams)!="undefined"  
        && whereStr!=""){  
        sql += " where " + whereStr;  
        setParams = setParams.concat(wherParams);  
    }  
    execSql(sql,setParams);  
}  
  
/** 
 * 插入数据 
 * @param tableName 
 * @param insertFields 
 * @param insertParams 
 */  
function insertTable(tableName,insertFields,insertParams){  
    var sql = "insert into "+tableName+" (";  
    var sql2 = " values(";  
    for(i in insertFields){  
        sql+=insertFields[i]+",";  
        sql2 +="?,"  
    }  
    sql = sql.substr(0,sql.length-1);  
    sql2 = sql2.substr(0,sql2.length-1);  
    sql += ")";  
    sql2 +=  ")";  
    execSql(sql+sql2,insertParams);  
}  
  
/** 
 * 删除数据 
 * @param tableName 
 * @param whereStr 
 * @param wherParams 
 * 例：deleteRow(tablename,"id=?",[123])  
 */  
function deleteRow(tableName,whereStr,wherParams){  
    var sql = "delete from "+tableName;  
    if(typeof(whereStr)!="undefined" && typeof(wherParams)!="undefined"  
        && whereStr!=""){  
        sql += " where " + whereStr;  
    }  
    execSql(sql,wherParams);
}     
  
/** 
 * 查询 
 * @param tableName 
 * @param selectFields  select的字段，用逗号分开，如果全部传"*" 
 * @param whereStr      where语句，参数用?代替 
 * @param wherParams    参数数组 
 * @callback 必填，返回的对象会放在callback函数作为参数传递 
 * 
 * 例：
 * select(table_picture,"*","id=?",[id],function(rows){  
 * 	   if(rows){  
 *         //如果查询到数据  
 * 	   }  
 * }) 
 */  
function select(tableName,selectFields,whereStr,wherParams,callback){  
    if(db==null){openDB();}  
    var sql = "SELECT "+selectFields+" FROM "+tableName;  
    if(typeof(whereStr)!="undefined" && typeof(wherParams)!="undefined"  
        && whereStr!=""){  
        sql += " where " + whereStr;  
    }  
     db.transaction(function(tx){  
          tx.executeSql(sql,wherParams,function(tx,results){  
              if(results.rows.length<1){  
                  if (typeof(callback) == 'function') {callback(false)} //没有数据  
              }else{  
                  if(typeof(callback) == 'function') {callback(results.rows)}  
              }  
          },function(tx,error){  
              return false;  
          });  
      });  
}  
  
/** 
 * 插入或更新 
 * @param tableName 
 * @param insertFields 
 * @param insertParams 
 * @param key           根据该key来判断是否有数据 
 * @param keyVal       
 * 
 * 例：saveOrUpdate(table_picture,['id','app_flow_no','original','ptr_type','ptr_name'],[pic.id,pic.appFlowNo,pic.original,pic.ptrType,pic.ptrName],'id',pic.id);  
 */  
function saveOrUpdate(tableName,insertFields,insertParams,key,keyVal){  
    if(typeof(key)!="undefined" && typeof(keyVal)!="undefined"  
        && key!=""){
        select(tableName,insertFields[0],key+"=?",[keyVal],function(rows){  
            if(rows){  
                updateTable(tableName,insertFields,insertParams,key+"=?",[keyVal]);  
            }else{  
                insertFields.push(key);  
                insertParams.push(keyVal);  
                insertTable(tableName,insertFields,insertParams);  
            }  
        })  
    }else{  
        insertTable(tableName,insertFields,insertParams);  
    }  
}  