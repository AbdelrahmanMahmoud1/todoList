//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://AbdelrahmanMahmoud:r9vB-gi6dvbVfSb@cluster0.plids.mongodb.net/todolistDB")

const itemsSchema = {
  name: String
}

const Item = mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Type"
})

const item2 = new Item({
  name: "your"
})

const item3 = new Item({
  name: "todo items here"
})

const defaultItems = [item1,item2, item3];

const listSchema = {
  name: String,
  items: [itemsSchema]
}

const List = mongoose.model("List", listSchema)



app.get("/", function(req, res) {

  Item.find(function(err,result){
    if(result.length === 0 ){
      Item.insertMany(defaultItems, function(err){
        if (err){
          console.log(err);
        }else{
          console.log("successfully added");
        }
      });
      res.redirect("/");
    }else{
      res.render("list", {listTitle: "Today", newListItems: result});

    }
  })

});

app.get("/:customListName",function(req, res){
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name:customListName}, function(err, fountList){
    if (!err){
      if(!fountList){
        const list = new List({
          name: customListName,
          items: defaultItems
        });
      list.save();
      res.redirect("/"+customListName)
      }else{
      res.render("list", {listTitle:fountList.name , newListItems: fountList.items});
      }
    }
  })

})

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
    name:itemName
  });
  if(listName === "Today"){
    newItem.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(newItem)
      foundList.save();
      res.redirect("/"+listName)
    })

  }




});


app.post("/delete",function(req,res){
  const checkedItem = req.body.checkbox;
  const listname = req.body.listName;


if(listname === "Today"){
  Item.findByIdAndRemove(checkedItem,function(err){
    if (err){
      console.log(err);
    }else{
      res.redirect("/")
    }
  })
}else{
  List.findOneAndUpdate({name:listname},{$pull:{items: {_id:checkedItem}}},function(err,foundList){
    if(!err){
      res.redirect("/"+listname)
    }
  })
}


})



app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
