function sleep (time: number): Promise<void> {
  return new Promise((reslove) => {
    setTimeout(() => {
      reslove()
    }, time)
  })
}

export default sleep