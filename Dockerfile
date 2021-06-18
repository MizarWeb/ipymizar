FROM continuumio/miniconda3

ENV NO_PROXY localhost,127.0.0.1,.si.c-s.fr,172.26.46.158
ENV HTTPS_PROXY http://proxy2.si.c-s.fr:3128
ENV HTTP_PROXY http://proxy2.si.c-s.fr:3128

ADD dev-environment.yml .

RUN conda env create --file dev-environment.yml
CMD ["tail", "-f", "/etc/resolv.conf"]

WORKDIR /etc/jupyterhub/mizar
