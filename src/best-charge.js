let loadAllItems = require('./items.js');
let loadPromotions = require('./promotions.js');

//将输入转换格式,增加属性并计算小计
function switchFormatFromInput(inputs) {
  let result = [];
  let allItems=loadAllItems();

  for(let item of inputs){
    result.push({id:item.split(' x ')[0],count:parseInt(item.split(' x ')[1])});
  }

  for(let value of result){
    for(let item of allItems){
      if(value.id === item.id){
        value.name = item.name;
        value.price = item.price;
        value.summary = item.price * value.count;
      }
    }
  }
  return result;
}


//计算“满30减6元”优惠方式的钱
function discount_30reduce6(resultInfo) {
  let charge = {subTotal:0,save:0};
  for(let item of resultInfo){
    charge.subTotal += item.summary;
  }
  if(charge.subTotal > 30){
    charge.save = 6;
    charge.subTotal -= 6;
  }
  return charge;
}


//计算“指定菜品半价”优惠方式的钱
function discount_reduceHalf(resultInfo) {
  let charge={discountName:[], subTotal:0, save:0};
  let promotions=loadPromotions()[1].items;

  for(let item of resultInfo){
    charge.subTotal += item.summary;
    if(promotions.includes(item.id)){
      charge.discountName.push(item.name);
      charge.save += item.summary/2;
    }
  }
  charge.subTotal -= charge.save;

  return charge;
}


//构建打印清单
function printReceipt(resultInfo, subTotal_1, subTotal_2) {
  let sum = 0;
  let str = `============= 订餐明细 =============
`;
  for(let item of resultInfo){
    str += `${item.name} x ${item.count} = ${item.summary}元\n`;
  }

  if(subTotal_1.save !== 0 || subTotal_2.save !== 0){

    str += '-----------------------------------\n使用优惠:\n';
    if(subTotal_2.subTotal > subTotal_1.subTotal){
      str += `满30减6元，省6元\n`;
      sum = subTotal_1.subTotal;
    }else{
      str += `指定菜品半价(${subTotal_2.discountName[0]}`;
      for (let i=1;i<subTotal_2.discountName.length;i++){
        str += `，${subTotal_2.discountName[i]}`;
        str += `)，省${subTotal_2.save}元\n`;
        sum = subTotal_2.subTotal;
      }
    }

  }else {
    sum = subTotal_1.subTotal;
  }

  str += `-----------------------------------\n总计：${sum}元\n===================================`;
  console.log(str);
  return str;
}
function bestCharge(selectedItems) {
  let resultInfo = switchFormatFromInput(selectedItems);
  let subTotal_1 = discount_30reduce6(resultInfo);
  let subTotal_2 = discount_reduceHalf(resultInfo);
  let print = printReceipt(resultInfo, subTotal_1, subTotal_2);
  return print;
}

module.exports = bestCharge;