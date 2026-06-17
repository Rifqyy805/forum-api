const hello = (container) => {
  return (req, res) => {
    res.status(200).json({ status: 'success', message: 'Hello World!' });
  };
};

export default hello;