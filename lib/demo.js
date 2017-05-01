module.exports = class Demo{
  async test(){
    return new Promise((resolve) => {
      setTimeout(resolve, 1000)
    });
  }
}
