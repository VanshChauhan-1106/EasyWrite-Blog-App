import { useEffect, useState } from "react";
import { Container, PostForm, Loader } from "../components";
import appwriteService from "../appwrite/config";
import { useNavigate, useParams } from "react-router-dom";

function EditPost() {
  const [post, setPost] = useState(null);
  const { slug } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (slug) {
      appwriteService.getPost(slug).then((post) => {
        if (post) {
          setPost(post);
        }
      });
    } else {
      navigate("/");
    }
  }, [slug, navigate])

  return post ? (
    <div className="py-24">
      <Container>
        <PostForm post={post} />
      </Container>
    </div>
  ) : <Loader />

}

export default EditPost;
